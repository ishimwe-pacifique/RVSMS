"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, TrendingUp, MapPin, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Animal Registrations</CardTitle>
            <Link href="/animals">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentActivity.animals.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.animals.map((animal) => (
                  <Link key={animal._id} href={`/animals/${animal._id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">{animal.animalId}</p>
                        <p className="text-sm text-slate-600">
                          {animal.species} - {animal.breed}
                        </p>
                        <p className="text-xs text-slate-500">Owner: {animal.ownerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{new Date(animal.registeredDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500 text-sm">No recent registrations</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Disease Reports</CardTitle>
            <Link href="/diseases">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentActivity.diseases.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.diseases.map((disease) => (
                  <Link key={disease._id} href={`/diseases/${disease._id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">{disease.reportId}</p>
                          <Badge
                            className={
                              disease.severity === "critical"
                                ? "bg-red-200 text-red-900 border-red-300"
                                : disease.severity === "severe"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : disease.severity === "moderate"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {disease.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{disease.diseaseName}</p>
                        <p className="text-xs text-slate-500">
                          {disease.location.sector}, {disease.location.district}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{new Date(disease.reportedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
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
