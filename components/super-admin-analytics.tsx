"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp, AlertTriangle, Activity, Filter } from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart
} from "recharts"

interface SuperAdminData {
  overview: {
    totalAnimals: number
    totalDiseases: number
    totalOutbreaks: number
    totalProvinces: number
  }
  provinces: Array<{
    province: string
    animals: {
      total: number
      healthy: number
      sick: number
      healthRate: number
    }
    diseases: {
      total: number
      activeOutbreaks: number
      critical: number
      severe: number
    }
    species: Array<{ name: string; count: number }>
    topDiseases: Array<{ name: string; count: number }>
  }>
  districts: Array<{
    province: string
    district: string
    totalAnimals: number
    healthRate: number
  }>
  sectors: Array<{
    province: string
    district: string
    sector: string
    totalAnimals: number
    healthRate: number
  }>
  trends: Array<{
    date: string
    province: string
    diseases: number
    outbreaks: number
  }>
}

const COLORS = ["#059669", "#0d9488", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"]

export function SuperAdminAnalytics() {
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")

  useEffect(() => {
    fetchSuperAdminData()
  }, [])

  const fetchSuperAdminData = async () => {
    try {
      const response = await fetch("/api/analytics/super-admin")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch super admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading national analytics...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Failed to load analytics data</p>
      </div>
    )
  }

  const filteredDistricts = selectedProvince === "all" 
    ? data.districts 
    : data.districts.filter(d => d.province === selectedProvince)

  const filteredSectors = selectedDistrict === "all" 
    ? (selectedProvince === "all" ? data.sectors : data.sectors.filter(s => s.province === selectedProvince))
    : data.sectors.filter(s => s.district === selectedDistrict)

  const provinceOptions = data.provinces.map(p => p.province)
  const districtOptions = filteredDistricts.map(d => d.district)

  return (
    <div className="space-y-6">
      {/* National Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Activity className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.totalAnimals.toLocaleString()}</div>
            <p className="text-emerald-100 text-sm">Across {data.overview.totalProvinces} provinces</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disease Cases</CardTitle>
            <AlertTriangle className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.totalDiseases.toLocaleString()}</div>
            <p className="text-amber-100 text-sm">Total reported cases</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Outbreaks</CardTitle>
            <MapPin className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.totalOutbreaks}</div>
            <p className="text-red-100 text-sm">Requiring attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Rate</CardTitle>
            <TrendingUp className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.overview.totalAnimals > 0 
                ? Math.round((data.provinces.reduce((sum, p) => sum + p.animals.healthy, 0) / data.overview.totalAnimals) * 100)
                : 0}%
            </div>
            <p className="text-blue-100 text-sm">National average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Location Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Provinces</SelectItem>
              {provinceOptions.map(province => (
                <SelectItem key={province} value={province}>{province}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={selectedProvince === "all"}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districtOptions.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedProvince("all")
              setSelectedDistrict("all")
            }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Province Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Animals by Province</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.provinces}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="province" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="animals.total" fill="#059669" name="Total Animals" />
                <Bar dataKey="animals.sick" fill="#ef4444" name="Sick Animals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disease Distribution by Province</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data.provinces}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="province" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="diseases.total" fill="#f59e0b" name="Total Diseases" />
                <Line type="monotone" dataKey="diseases.activeOutbreaks" stroke="#ef4444" strokeWidth={3} name="Active Outbreaks" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Province Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Province Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.provinces.map((province) => (
              <div key={province.province} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{province.province}</h3>
                  <Badge variant={province.animals.healthRate > 80 ? "default" : province.animals.healthRate > 60 ? "secondary" : "destructive"}>
                    {province.animals.healthRate}% Healthy
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{province.animals.total.toLocaleString()}</div>
                    <div className="text-sm text-slate-600">Total Animals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{province.diseases.total}</div>
                    <div className="text-sm text-slate-600">Disease Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{province.diseases.activeOutbreaks}</div>
                    <div className="text-sm text-slate-600">Active Outbreaks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700">{province.diseases.critical}</div>
                    <div className="text-sm text-slate-600">Critical Cases</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Top Species</h4>
                    <div className="space-y-1">
                      {province.species.slice(0, 3).map((species, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{species.name}</span>
                          <span className="font-medium">{species.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Top Diseases</h4>
                    <div className="space-y-1">
                      {province.topDiseases.slice(0, 3).map((disease, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{disease.name}</span>
                          <span className="font-medium">{disease.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* District Level Data */}
      {selectedProvince !== "all" && (
        <Card>
          <CardHeader>
            <CardTitle>Districts in {selectedProvince}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredDistricts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalAnimals" fill="#0d9488" name="Total Animals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sector Level Data */}
      {selectedDistrict !== "all" && (
        <Card>
          <CardHeader>
            <CardTitle>Sectors in {selectedDistrict}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredSectors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalAnimals" fill="#3b82f6" name="Total Animals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Disease Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Disease Trends (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.trends.reduce((acc: any[], curr) => {
              const existing = acc.find(item => item.date === curr.date)
              if (existing) {
                existing.diseases += curr.diseases
                existing.outbreaks += curr.outbreaks
              } else {
                acc.push({ date: curr.date, diseases: curr.diseases, outbreaks: curr.outbreaks })
              }
              return acc
            }, []).sort((a, b) => a.date.localeCompare(b.date))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="diseases" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Disease Cases" />
              <Area type="monotone" dataKey="outbreaks" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Outbreaks" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}