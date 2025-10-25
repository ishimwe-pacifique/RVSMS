"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, TrendingUp, MapPin, ArrowUpRight, Filter, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { rwandaProvinces } from "@/lib/rwanda-locations"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DashboardData {
  stats: {
    totalAnimals: number
    healthyAnimals: number
    sickAnimals: number
    underTreatment: number
    totalDiseases: number
    activeOutbreaks: number
    recentDiseases: number
  }
  charts: {
    animalsBySpecies: Array<{ name: string; value: number }>
    diseasesByType: Array<{ name: string; value: number }>
    diseasesBySeverity: Array<{ name: string; value: number }>
    diseaseTrends: Array<{ month: string; count: number }>
    topDiseases: Array<{ name: string; value: number }>
  }
  recentActivity: {
    animals: Array<any>
    diseases: Array<any>
  }
}

interface FilterState {
  province: string
  district: string
  sector: string
  search: string
}

const COLORS = ["#059669", "#0d9488", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]
const SEVERITY_COLORS = {
  mild: "#fbbf24",
  moderate: "#f97316",
  severe: "#dc2626",
  critical: "#991b1b",
}

export function DashboardAnalytics() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [animalFilters, setAnimalFilters] = useState<FilterState>({ province: "", district: "", sector: "", search: "" })
  const [diseaseFilters, setDiseaseFilters] = useState<FilterState>({ province: "", district: "", sector: "", search: "" })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading analytics...</p>
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

  const healthPercentage =
    data.stats.totalAnimals > 0 ? Math.round((data.stats.healthyAnimals / data.stats.totalAnimals) * 100) : 0

  // Helper function to get districts for selected province
  const getDistrictsForProvince = (provinceName: string) => {
    return rwandaProvinces.find(p => p.name === provinceName)?.districts || []
  }

  // Helper function to get sectors for selected district
  const getSectorsForDistrict = (provinceName: string, districtName: string) => {
    return rwandaProvinces
      .find(p => p.name === provinceName)?.districts
      .find(d => d.name === districtName)?.sectors || []
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Animals</CardTitle>
            <Activity className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.stats.totalAnimals}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data.stats.healthyAnimals} healthy ({healthPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Disease Cases</CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.stats.totalDiseases}</div>
            <p className="text-xs text-slate-500 mt-1">{data.stats.recentDiseases} in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Under Treatment</CardTitle>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.stats.underTreatment}</div>
            <p className="text-xs text-slate-500 mt-1">{data.stats.sickAnimals} currently sick</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Outbreaks</CardTitle>
            <MapPin className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.stats.activeOutbreaks}</div>
            <p className="text-xs text-slate-500 mt-1">Requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Link href="/animals/register">
            <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Activity className="w-4 h-4" />
              Register New Animal
            </Button>
          </Link>
          <Link href="/diseases/report">
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <AlertCircle className="w-4 h-4" />
              Report Disease Case
            </Button>
          </Link>
          <Link href="/monitoring">
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <MapPin className="w-4 h-4" />
              View Disease Map
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disease Trends */}
        {data.charts.diseaseTrends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disease Trends (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.charts.diseaseTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} name="Cases" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Animals by Species */}
        {data.charts.animalsBySpecies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Animals by Species</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.charts.animalsBySpecies}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.charts.animalsBySpecies.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Diseases */}
        {data.charts.topDiseases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 5 Diseases</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.topDiseases} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#0d9488" name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Diseases by Severity */}
        {data.charts.diseasesBySeverity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diseases by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.diseasesBySeverity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" name="Cases">
                    {data.charts.diseasesBySeverity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || "#64748b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity with Enhanced Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Animal Registrations Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Recent Animal Registrations
            </CardTitle>
            <Link href="/animals">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Animal Filters */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={animalFilters.search}
                    onChange={(e) => setAnimalFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select value={animalFilters.province || undefined} onValueChange={(value) => setAnimalFilters(prev => ({ ...prev, province: value || "", district: "", sector: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    {rwandaProvinces.map((province) => (
                      <SelectItem key={province.name} value={province.name}>{province.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={animalFilters.district || undefined} onValueChange={(value) => setAnimalFilters(prev => ({ ...prev, district: value || "", sector: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalFilters.province && rwandaProvinces
                      .find(p => p.name === animalFilters.province)?.districts
                      .map((district) => (
                        <SelectItem key={district.name} value={district.name}>{district.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select value={animalFilters.sector || undefined} onValueChange={(value) => setAnimalFilters(prev => ({ ...prev, sector: value || "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalFilters.district && rwandaProvinces
                      .find(p => p.name === animalFilters.province)?.districts
                      .find(d => d.name === animalFilters.district)?.sectors
                      .map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAnimalFilters({ province: "", district: "", sector: "", search: "" })}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {data.recentActivity.animals.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal ID</TableHead>
                      <TableHead>Species/Breed</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentActivity.animals
                      .filter(animal => {
                        const matchesSearch = !animalFilters.search || 
                          (animal.animalId && animal.animalId.toLowerCase().includes(animalFilters.search.toLowerCase())) ||
                          (animal.ownerName && animal.ownerName.toLowerCase().includes(animalFilters.search.toLowerCase())) ||
                          (animal.species && animal.species.toLowerCase().includes(animalFilters.search.toLowerCase()))
                        
                        const matchesProvince = !animalFilters.province || animal.location?.province === animalFilters.province
                        const matchesDistrict = !animalFilters.district || animal.location?.district === animalFilters.district
                        const matchesSector = !animalFilters.sector || animal.location?.sector === animalFilters.sector
                        
                        return matchesSearch && matchesProvince && matchesDistrict && matchesSector
                      })
                      .map((animal) => (
                        <TableRow key={animal._id} className="hover:bg-slate-50">
                          <TableCell>
                            <Link href={`/animals/${animal._id}`} className="font-medium text-emerald-600 hover:text-emerald-700">
                              {animal.animalId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{animal.species}</p>
                              <p className="text-sm text-slate-500">{animal.breed}</p>
                            </div>
                          </TableCell>
                          <TableCell>{animal.ownerName}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-semibold text-slate-900">{animal.location?.sector || 'N/A'}</p>
                              <p className="text-slate-700">{animal.location?.district || 'N/A'}</p>
                              <p className="text-sm text-slate-600">{animal.location?.province || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(animal.registeredDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500 text-sm">No recent registrations</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Disease Reports Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Recent Disease Reports
            </CardTitle>
            <Link href="/diseases">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Disease Filters */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={diseaseFilters.search}
                    onChange={(e) => setDiseaseFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select value={diseaseFilters.province || undefined} onValueChange={(value) => setDiseaseFilters(prev => ({ ...prev, province: value || "", district: "", sector: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    {rwandaProvinces.map((province) => (
                      <SelectItem key={province.name} value={province.name}>{province.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={diseaseFilters.district || undefined} onValueChange={(value) => setDiseaseFilters(prev => ({ ...prev, district: value || "", sector: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    {diseaseFilters.province && rwandaProvinces
                      .find(p => p.name === diseaseFilters.province)?.districts
                      .map((district) => (
                        <SelectItem key={district.name} value={district.name}>{district.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select value={diseaseFilters.sector || undefined} onValueChange={(value) => setDiseaseFilters(prev => ({ ...prev, sector: value || "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    {diseaseFilters.district && rwandaProvinces
                      .find(p => p.name === diseaseFilters.province)?.districts
                      .find(d => d.name === diseaseFilters.district)?.sectors
                      .map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDiseaseFilters({ province: "", district: "", sector: "", search: "" })}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {data.recentActivity.diseases.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Disease</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentActivity.diseases
                      .filter(disease => {
                        const matchesSearch = !diseaseFilters.search || 
                          disease.reportId.toLowerCase().includes(diseaseFilters.search.toLowerCase()) ||
                          disease.diseaseName.toLowerCase().includes(diseaseFilters.search.toLowerCase())
                        
                        const matchesProvince = !diseaseFilters.province || disease.location?.province === diseaseFilters.province
                        const matchesDistrict = !diseaseFilters.district || disease.location?.district === diseaseFilters.district
                        const matchesSector = !diseaseFilters.sector || disease.location?.sector === diseaseFilters.sector
                        
                        return matchesSearch && matchesProvince && matchesDistrict && matchesSector
                      })
                      .map((disease) => (
                        <TableRow key={disease._id} className="hover:bg-slate-50">
                          <TableCell>
                            <Link href={`/diseases/${disease._id}`} className="font-medium text-red-600 hover:text-red-700">
                              {disease.reportId}
                            </Link>
                          </TableCell>
                          <TableCell className="font-medium">{disease.diseaseName}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{disease.location.sector}</p>
                              <p className="text-slate-500">{disease.location.district}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                disease.severity === "critical"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : disease.severity === "severe"
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : disease.severity === "moderate"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : "bg-green-100 text-green-800 border-green-200"
                              }
                            >
                              {disease.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(disease.reportedDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500 text-sm">No recent reports</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
