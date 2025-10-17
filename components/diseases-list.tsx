"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { DiseaseReport } from "@/lib/types"

export function DiseasesList() {
  const [reports, setReports] = useState<DiseaseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [outbreakFilter, setOutbreakFilter] = useState("all")

  useEffect(() => {
    fetchReports()
  }, [search, typeFilter, severityFilter, outbreakFilter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (typeFilter !== "all") params.append("diseaseType", typeFilter)
      if (severityFilter !== "all") params.append("severity", severityFilter)
      if (outbreakFilter === "true") params.append("isOutbreak", "true")

      const response = await fetch(`/api/diseases?${params}`)
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
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

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "recovered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "under_treatment":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "deceased":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "ongoing":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by ID or disease..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
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

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={outbreakFilter} onValueChange={setOutbreakFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Reports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="true">Outbreaks Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">Loading disease reports...</CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p className="text-sm">No disease reports found</p>
            <p className="text-xs mt-1">Try adjusting your search filters or report a new case</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{report.reportId}</h3>
                      {report.isOutbreak && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Outbreak
                        </Badge>
                      )}
                      <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                      <Badge className={getOutcomeColor(report.outcome || "ongoing")}>
                        {report.outcome?.replace("_", " ") || "ongoing"}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Disease</p>
                        <p className="font-medium text-slate-900">{report.diseaseName}</p>
                        <p className="text-xs text-slate-500 capitalize">{report.diseaseType}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Animal</p>
                        <p className="font-medium text-slate-900">
                          {report.animalDetails.species} - {report.animalDetails.breed}
                        </p>
                        <p className="text-xs text-slate-500">{report.animalDetails.age} years old</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium text-slate-900">
                          {report.location.sector}, {report.location.district}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reported Date</p>
                        <p className="font-medium text-slate-900">
                          {new Date(report.reportedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {report.isOutbreak && report.affectedAnimalsCount && (
                      <div className="mt-3 text-sm">
                        <p className="text-red-600 font-medium">
                          {report.affectedAnimalsCount} animals affected in this outbreak
                        </p>
                      </div>
                    )}
                  </div>

                  <Link href={`/diseases/${report._id}`}>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
