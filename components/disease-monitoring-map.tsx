"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, MapPin, Activity, TrendingUp, Filter } from "lucide-react"
import { rwandaProvinces } from "@/lib/rwanda-locations"
import Link from "next/link"

interface AnimalDiseaseCase {
  _id: string
  caseId: string
  animal: {
    _id: string
    tagNumber: string
    species: string
    breed: string
    owner: {
      name: string
      phone: string
    }
  }
  disease: {
    name: string
    type: string
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
  }
  location: {
    province: string
    district: string
    sector: string
    cell?: string
    village?: string
    latitude: number
    longitude: number
  }
  diagnosisDate: string
  reportedDate: string
  veterinarian: {
    name: string
    license: string
  }
  symptoms: string[]
  treatment?: string
  status: 'active' | 'treated' | 'recovered' | 'deceased'
  isOutbreak: boolean
  notes?: string
}

interface DiseaseMapStats {
  totalCases: number
  activeOutbreaks: number
  affectedAnimals: number
  affectedLocations: number
  bySeverity: {
    mild: number
    moderate: number
    severe: number
    critical: number
  }
  bySpecies: {
    cattle: number
    goats: number
    sheep: number
    pigs: number
    poultry: number
    other: number
  }
  byStatus: {
    active: number
    treated: number
    recovered: number
    deceased: number
  }
}

export function DiseaseMonitoringMap() {
  const [cases, setCases] = useState<AnimalDiseaseCase[]>([])
  const [stats, setStats] = useState<DiseaseMapStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<AnimalDiseaseCase | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    diseaseType: "all",
    severity: "all",
    species: "all",
    status: "all",
    province: "all",
    district: "all",
    startDate: "",
    endDate: "",
  })

  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    fetchMapData()
  }, [filters])

  useEffect(() => {
    if (typeof window !== "undefined" && !mapInstanceRef.current) {
      initializeMap()
    } else if (mapInstanceRef.current) {
      updateMarkers()
    }
  }, [cases])

  const fetchMapData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.diseaseType !== "all") params.append("diseaseType", filters.diseaseType)
      if (filters.severity !== "all") params.append("severity", filters.severity)
      if (filters.species !== "all") params.append("species", filters.species)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.province !== "all") params.append("province", filters.province)
      if (filters.district !== "all") params.append("district", filters.district)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/animals/disease-cases/map?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCases(data.cases || [])
        setStats(data.stats || null)
      } else {
        throw new Error(data.error || "Failed to fetch disease cases")
      }
    } catch (error) {
      console.error("Failed to fetch disease cases:", error)
      setCases([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }



  const initializeMap = async () => {
    const L = (await import("leaflet")).default
    await import("leaflet/dist/leaflet.css")

    // Fix for default marker icons in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })

    if (mapRef.current && !mapInstanceRef.current) {
      // Center on Rwanda with optimal bounds
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      }).setView([-1.9403, 29.8739], 9)

      // Use a more professional map style
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 7
      }).addTo(map)

      // Set Rwanda bounds to restrict panning
      const rwandaBounds = L.latLngBounds(
        [-2.917, 28.862], // Southwest
        [-1.047, 30.899]  // Northeast
      )
      map.setMaxBounds(rwandaBounds)
      map.fitBounds(rwandaBounds, { padding: [20, 20] })

      mapInstanceRef.current = map
      updateMarkers()
    }
  }

  const updateMarkers = async () => {
    if (!mapInstanceRef.current) return

    const L = (await import("leaflet")).default

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (!cases.length) return

    // Add new markers for disease cases
    cases.forEach((diseaseCase) => {
      if (diseaseCase.location?.latitude && diseaseCase.location?.longitude) {
        const markerColor = getMarkerColor(diseaseCase.disease?.severity || 'mild')
        const iconSize = diseaseCase.isOutbreak ? 35 : 25

        const customIcon = L.divIcon({
          className: "custom-disease-marker",
          html: `<div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background: linear-gradient(135deg, ${markerColor}, ${getDarkerColor(markerColor)});
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          ">
            ${diseaseCase.isOutbreak ? '<span style="color: white; font-size: 16px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.7);">🚨</span>' : getAnimalIcon(diseaseCase.animal?.species || 'unknown')}
          </div>`,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2],
        })

        const marker = L.marker([diseaseCase.location.latitude, diseaseCase.location.longitude], {
          icon: customIcon,
        }).addTo(mapInstanceRef.current)

        marker.on("click", () => {
          setSelectedCase(diseaseCase)
        })

        const popupContent = `
          <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 14px; margin: -12px -12px 12px -12px; border-radius: 10px 10px 0 0;">
              <h3 style="font-weight: 700; margin: 0; color: #1e293b; font-size: 17px;">${diseaseCase.disease?.name || 'Unknown Disease'}</h3>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">${diseaseCase.animal?.species || 'Unknown'} • Tag: ${diseaseCase.animal?.tagNumber || 'N/A'}</p>
              ${diseaseCase.isOutbreak ? '<div style="display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 10px; border-radius: 15px; font-size: 11px; font-weight: 600; margin-top: 6px; border: 1px solid #fecaca;">🚨 OUTBREAK ALERT</div>' : ''}
            </div>
            <div style="padding: 0 2px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="background: #f1f5f9; padding: 8px; border-radius: 6px; text-align: center;">
                  <div style="color: #64748b; font-size: 11px; font-weight: 500;">SEVERITY</div>
                  <div style="color: ${markerColor}; font-size: 13px; font-weight: 700; text-transform: uppercase;">${diseaseCase.disease?.severity || 'mild'}</div>
                </div>
                <div style="background: #f1f5f9; padding: 8px; border-radius: 6px; text-align: center;">
                  <div style="color: #64748b; font-size: 11px; font-weight: 500;">STATUS</div>
                  <div style="color: #334155; font-size: 13px; font-weight: 700; text-transform: uppercase;">${diseaseCase.status || 'active'}</div>
                </div>
              </div>
              <div style="margin-bottom: 10px;">
                <div style="color: #64748b; font-size: 12px; font-weight: 500; margin-bottom: 4px;">📍 LOCATION</div>
                <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border-left: 3px solid ${markerColor};">
                  <div style="font-weight: 600; color: #334155; font-size: 13px;">${diseaseCase.location?.sector || 'Unknown'} Sector</div>
                  <div style="color: #64748b; font-size: 12px;">${diseaseCase.location?.district || 'Unknown'}, ${diseaseCase.location?.province || 'Unknown'}</div>
                </div>
              </div>
              <div style="margin-bottom: 10px;">
                <div style="color: #64748b; font-size: 12px; font-weight: 500; margin-bottom: 4px;">👨⚕️ VETERINARIAN</div>
                <div style="color: #334155; font-size: 13px; font-weight: 500;">${diseaseCase.veterinarian?.name || 'Unknown'}</div>
              </div>
              <div style="color: #64748b; font-size: 11px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                Diagnosed: ${diseaseCase.diagnosisDate ? new Date(diseaseCase.diagnosisDate).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
        markersRef.current.push(marker)
      }
    })
  }

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "#10b981" // Emerald
      case "moderate":
        return "#f59e0b" // Amber
      case "severe":
        return "#ef4444" // Red
      case "critical":
        return "#dc2626" // Dark red
      default:
        return "#6b7280" // Gray
    }
  }

  const getDarkerColor = (color: string) => {
    switch (color) {
      case "#10b981":
        return "#059669"
      case "#f59e0b":
        return "#d97706"
      case "#ef4444":
        return "#dc2626"
      case "#dc2626":
        return "#991b1b"
      default:
        return "#4b5563"
    }
  }

  const getAnimalIcon = (species: string) => {
    const icons = {
      cattle: '🐄',
      goats: '🐐',
      sheep: '🐑',
      pigs: '🐷',
      poultry: '🐔',
      chicken: '🐔',
      default: '🐾'
    }
    const icon = icons[species.toLowerCase() as keyof typeof icons] || icons.default
    return `<span style="font-size: 12px;">${icon}</span>`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "moderate":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "severe":
        return "bg-red-100 text-red-700 border-red-200"
      case "critical":
        return "bg-red-200 text-red-900 border-red-300"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const selectedProvince = rwandaProvinces.find((p) => p.name === filters.province)

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .custom-disease-marker {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
        }
        .custom-disease-marker:hover {
          transform: scale(1.1);
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
        }
        .leaflet-popup-tip {
          border-top-color: #e2e8f0 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .leaflet-control-zoom a {
          border: none !important;
          background: white !important;
          color: #374151 !important;
          font-weight: 600 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
      `}</style>
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Cases</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalCases}</div>
              <p className="text-xs text-slate-500">Active disease cases</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Outbreaks</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.activeOutbreaks}</div>
              <p className="text-xs text-slate-500">Active outbreak alerts</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Critical Cases</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.bySeverity.critical}</div>
              <p className="text-xs text-slate-500">Immediate attention required</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Locations</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.affectedLocations}</div>
              <p className="text-xs text-slate-500">Affected areas</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  Rwanda Disease Monitoring Map
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Real-time veterinary disease surveillance across Rwanda</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </CardHeader>
            <CardContent>
              {showFilters && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Animal Species</Label>
                      <Select
                        value={filters.species}
                        onValueChange={(value) => setFilters({ ...filters, species: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Species</SelectItem>
                          <SelectItem value="cattle">Cattle</SelectItem>
                          <SelectItem value="goats">Goats</SelectItem>
                          <SelectItem value="sheep">Sheep</SelectItem>
                          <SelectItem value="pigs">Pigs</SelectItem>
                          <SelectItem value="poultry">Poultry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Case Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="treated">Under Treatment</SelectItem>
                          <SelectItem value="recovered">Recovered</SelectItem>
                          <SelectItem value="deceased">Deceased</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select
                        value={filters.severity}
                        onValueChange={(value) => setFilters({ ...filters, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severity</SelectItem>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Province</Label>
                      <Select
                        value={filters.province}
                        onValueChange={(value) => setFilters({ ...filters, province: value, district: "all" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Provinces</SelectItem>
                          {rwandaProvinces.map((province) => (
                            <SelectItem key={province.name} value={province.name}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>District</Label>
                      <Select
                        value={filters.district}
                        onValueChange={(value) => setFilters({ ...filters, district: value })}
                        disabled={filters.province === "all"}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Districts</SelectItem>
                          {selectedProvince?.districts.map((district) => (
                            <SelectItem key={district.name} value={district.name}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        diseaseType: "all",
                        severity: "all",
                        species: "all",
                        status: "all",
                        province: "all",
                        district: "all",
                        startDate: "",
                        endDate: "",
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              <div className="relative overflow-hidden rounded-xl">
                <div ref={mapRef} className="h-[600px] w-full bg-slate-100 border-2 border-slate-200" />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <p className="text-slate-600">Loading map data...</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Map Legend
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <span className="text-slate-700 font-medium">Mild</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
                    <span className="text-slate-700 font-medium">Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                    <span className="text-slate-700 font-medium">Severe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-700 border-2 border-white shadow-sm" />
                    <span className="text-slate-700 font-medium">Critical</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⚠</span>
                    </div>
                    <span className="text-slate-700 font-medium">Outbreak Alert</span>
                    <span className="text-xs text-slate-500">(Larger markers indicate outbreaks)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedCase ? (
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-cyan-50">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl">{getAnimalIcon(selectedCase.animal.species).replace('<span style="font-size: 12px;">', '').replace('</span>', '')}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{selectedCase.disease.name}</h3>
                      <p className="text-sm text-slate-600">{selectedCase.animal.species} • Tag #{selectedCase.animal.tagNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Badge className={getSeverityColor(selectedCase.disease.severity)}>
                      {selectedCase.disease.severity}
                    </Badge>
                    {selectedCase.isOutbreak && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Outbreak
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {selectedCase.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-500 font-medium mb-1">Animal Details</p>
                    <p className="font-medium text-slate-900">{selectedCase.animal.breed} {selectedCase.animal.species}</p>
                    <p className="text-xs text-slate-600">Owner: {selectedCase.animal.owner.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-500 font-medium">Location</p>
                    <p className="font-medium text-slate-900">
                      {selectedCase.location.sector} Sector, {selectedCase.location.district}
                    </p>
                    <p className="text-xs text-slate-500">{selectedCase.location.province} Province</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-500 font-medium">Veterinarian</p>
                    <p className="font-medium text-slate-900">{selectedCase.veterinarian.name}</p>
                    <p className="text-xs text-slate-500">License: {selectedCase.veterinarian.license}</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-500 font-medium">Diagnosis Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedCase.diagnosisDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {selectedCase.symptoms.length > 0 && (
                    <div>
                      <p className="text-slate-500 font-medium">Symptoms</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCase.symptoms.slice(0, 3).map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {selectedCase.symptoms.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{selectedCase.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link href={`/animals/cases/${selectedCase._id}`}>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    View Full Case Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-600 mb-2">No Case Selected</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Click on any marker on the map to view detailed information about disease cases in that location
                </p>
              </CardContent>
            </Card>
          )}

          {stats && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Distribution Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-2">By Severity</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Mild</span>
                      <span className="font-medium text-emerald-600">{stats.bySeverity.mild}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Moderate</span>
                      <span className="font-medium text-amber-600">{stats.bySeverity.moderate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Severe</span>
                      <span className="font-medium text-red-600">{stats.bySeverity.severe}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Critical</span>
                      <span className="font-medium text-red-700">{stats.bySeverity.critical}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">By Species</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 flex items-center gap-1">🐄 Cattle</span>
                      <span className="font-medium text-slate-900">{stats.bySpecies.cattle}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 flex items-center gap-1">🐐 Goats</span>
                      <span className="font-medium text-slate-900">{stats.bySpecies.goats}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 flex items-center gap-1">🐑 Sheep</span>
                      <span className="font-medium text-slate-900">{stats.bySpecies.sheep}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 flex items-center gap-1">🐷 Pigs</span>
                      <span className="font-medium text-slate-900">{stats.bySpecies.pigs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 flex items-center gap-1">🐔 Poultry</span>
                      <span className="font-medium text-slate-900">{stats.bySpecies.poultry}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}