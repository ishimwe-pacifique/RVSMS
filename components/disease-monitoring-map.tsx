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

interface MapReport {
  _id: string
  reportId: string
  diseaseName: string
  diseaseType: string
  severity: string
  isOutbreak: boolean
  affectedAnimalsCount?: number
  location: {
    province: string
    district: string
    sector: string
    latitude: number
    longitude: number
  }
  diagnosisDate: string
  reportedDate: string
  outcome?: string
}

interface MapStats {
  total: number
  outbreaks: number
  bySeverity: {
    mild: number
    moderate: number
    severe: number
    critical: number
  }
  byType: {
    viral: number
    bacterial: number
    parasitic: number
    fungal: number
    other: number
  }
}

export function DiseaseMonitoringMap() {
  const [reports, setReports] = useState<MapReport[]>([])
  const [stats, setStats] = useState<MapStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    diseaseType: "all",
    severity: "all",
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
    if (typeof window !== "undefined" && reports.length > 0 && !mapInstanceRef.current) {
      initializeMap()
    } else if (mapInstanceRef.current && reports.length > 0) {
      updateMarkers()
    }
  }, [reports])

  const fetchMapData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.diseaseType !== "all") params.append("diseaseType", filters.diseaseType)
      if (filters.severity !== "all") params.append("severity", filters.severity)
      if (filters.province !== "all") params.append("province", filters.province)
      if (filters.district !== "all") params.append("district", filters.district)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/diseases/map?${params}`)
      const data = await response.json()
      setReports(data.reports || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error("Failed to fetch map data:", error)
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
      // Center on Rwanda
      const map = L.map(mapRef.current).setView([-1.9403, 29.8739], 8)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

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

    // Add new markers
    reports.forEach((report) => {
      if (report.location.latitude && report.location.longitude) {
        const markerColor = getMarkerColor(report.severity)
        const iconSize = report.isOutbreak ? 30 : 20

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background-color: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            ${report.isOutbreak ? '<span style="color: white; font-size: 16px; font-weight: bold;">!</span>' : ""}
          </div>`,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2],
        })

        const marker = L.marker([report.location.latitude, report.location.longitude], {
          icon: customIcon,
        }).addTo(mapInstanceRef.current)

        marker.on("click", () => {
          setSelectedReport(report)
        })

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${report.diseaseName}</h3>
            <p style="margin: 4px 0;"><strong>Report ID:</strong> ${report.reportId}</p>
            <p style="margin: 4px 0;"><strong>Severity:</strong> ${report.severity}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${report.location.sector}, ${report.location.district}</p>
            ${report.isOutbreak ? `<p style="margin: 4px 0; color: #dc2626;"><strong>⚠️ Outbreak Alert</strong></p>` : ""}
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
        return "#fbbf24"
      case "moderate":
        return "#f97316"
      case "severe":
        return "#dc2626"
      case "critical":
        return "#991b1b"
      default:
        return "#64748b"
    }
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
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Cases</CardTitle>
              <Activity className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-xs text-slate-500 mt-1">Disease reports on map</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Outbreaks</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.outbreaks}</div>
              <p className="text-xs text-slate-500 mt-1">Active outbreak alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Critical Cases</CardTitle>
              <TrendingUp className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.bySeverity.critical}</div>
              <p className="text-xs text-slate-500 mt-1">Requiring immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Locations</CardTitle>
              <MapPin className="w-4 h-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {new Set(reports.map((r) => r.location.sector)).size}
              </div>
              <p className="text-xs text-slate-500 mt-1">Affected sectors</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Interactive Disease Map</CardTitle>
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
                      <Label>Disease Type</Label>
                      <Select
                        value={filters.diseaseType}
                        onValueChange={(value) => setFilters({ ...filters, diseaseType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="viral">Viral</SelectItem>
                          <SelectItem value="bacterial">Bacterial</SelectItem>
                          <SelectItem value="parasitic">Parasitic</SelectItem>
                          <SelectItem value="fungal">Fungal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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

              <div className="relative">
                <div ref={mapRef} className="h-[500px] w-full rounded-lg border border-slate-200 bg-slate-100" />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <p className="text-slate-600">Loading map data...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white" />
                  <span className="text-slate-600">Mild</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white" />
                  <span className="text-slate-600">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white" />
                  <span className="text-slate-600">Severe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-900 border-2 border-white" />
                  <span className="text-slate-600">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    !
                  </div>
                  <span className="text-slate-600">Outbreak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Case</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{selectedReport.diseaseName}</h3>
                    {selectedReport.isOutbreak && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Outbreak
                      </Badge>
                    )}
                  </div>
                  <Badge className={getSeverityColor(selectedReport.severity)}>{selectedReport.severity}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500">Report ID</p>
                    <p className="font-medium text-slate-900">{selectedReport.reportId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Type</p>
                    <p className="font-medium text-slate-900 capitalize">{selectedReport.diseaseType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Location</p>
                    <p className="font-medium text-slate-900">
                      {selectedReport.location.sector}, {selectedReport.location.district}
                    </p>
                    <p className="text-xs text-slate-500">{selectedReport.location.province}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Diagnosis Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedReport.diagnosisDate).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedReport.isOutbreak && selectedReport.affectedAnimalsCount && (
                    <div>
                      <p className="text-slate-500">Affected Animals</p>
                      <p className="font-medium text-red-600">{selectedReport.affectedAnimalsCount} animals</p>
                    </div>
                  )}
                </div>

                <Link href={`/diseases/${selectedReport._id}`}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Full Report</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Click on a marker to view case details</p>
              </CardContent>
            </Card>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disease Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-2">By Severity</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Mild</span>
                      <span className="font-medium text-yellow-600">{stats.bySeverity.mild}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Moderate</span>
                      <span className="font-medium text-orange-600">{stats.bySeverity.moderate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Severe</span>
                      <span className="font-medium text-red-600">{stats.bySeverity.severe}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Critical</span>
                      <span className="font-medium text-red-900">{stats.bySeverity.critical}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">By Type</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Viral</span>
                      <span className="font-medium text-slate-900">{stats.byType.viral}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Bacterial</span>
                      <span className="font-medium text-slate-900">{stats.byType.bacterial}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Parasitic</span>
                      <span className="font-medium text-slate-900">{stats.byType.parasitic}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Fungal</span>
                      <span className="font-medium text-slate-900">{stats.byType.fungal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">Other</span>
                      <span className="font-medium text-slate-900">{stats.byType.other}</span>
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
