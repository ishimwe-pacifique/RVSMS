"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, MapPin, Activity, AlertTriangle, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import type { DiseaseReport, Animal } from "@/lib/types"

export function DiseaseReportDetails({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<DiseaseReport | null>(null)
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/diseases/${reportId}`)
      const data = await response.json()
      setReport(data.report)
      setAnimal(data.animal)
    } catch (error) {
      console.error("Failed to fetch report:", error)
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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">Loading report details...</CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">Report not found</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{report.reportId}</h1>
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
          <p className="text-slate-600">{report.diseaseName}</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Edit className="w-4 h-4" />
          Update Status
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Disease Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-slate-500 text-sm">Disease Name</p>
              <p className="font-medium text-slate-900">{report.diseaseName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 text-sm">Type</p>
                <p className="font-medium text-slate-900 capitalize">{report.diseaseType}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Severity</p>
                <p className="font-medium text-slate-900 capitalize">{report.severity}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Diagnosis Method</p>
              <p className="font-medium text-slate-900">{report.diagnosisMethod}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Diagnosis Date</p>
              <p className="font-medium text-slate-900">
                {new Date(report.diagnosisDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-slate-700">{symptom}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {animal && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Affected Animal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-slate-500 text-sm">Animal ID</p>
                <Link href={`/animals/${animal._id}`} className="font-medium text-emerald-600 hover:underline">
                  {animal.animalId}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm">Species</p>
                  <p className="font-medium text-slate-900 capitalize">{animal.species}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Breed</p>
                  <p className="font-medium text-slate-900">{animal.breed}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Owner</p>
                <p className="font-medium text-slate-900">{animal.ownerName}</p>
                <p className="text-sm text-slate-600">{animal.ownerContact}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Province</p>
                <p className="font-medium text-slate-900">{report.location.province}</p>
              </div>
              <div>
                <p className="text-slate-500">District</p>
                <p className="font-medium text-slate-900">{report.location.district}</p>
              </div>
              <div>
                <p className="text-slate-500">Sector</p>
                <p className="font-medium text-slate-900">{report.location.sector}</p>
              </div>
              {report.location.cell && (
                <div>
                  <p className="text-slate-500">Cell</p>
                  <p className="font-medium text-slate-900">{report.location.cell}</p>
                </div>
              )}
            </div>
            {report.location.latitude && report.location.longitude && (
              <div>
                <p className="text-slate-500 text-sm">Coordinates</p>
                <p className="font-medium text-slate-900 text-sm">
                  {report.location.latitude}, {report.location.longitude}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {report.treatmentProvided && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Treatment Provided</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{report.treatmentProvided}</p>
          </CardContent>
        </Card>
      )}

      {report.isOutbreak && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Outbreak Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 font-medium">
              This disease has been reported as an outbreak affecting {report.affectedAnimalsCount || "multiple"}{" "}
              animals in the area.
            </p>
            {report.notes && <p className="text-red-700 mt-2 text-sm">{report.notes}</p>}
          </CardContent>
        </Card>
      )}

      {report.notes && !report.isOutbreak && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{report.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            Report Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-slate-500 text-sm">Reported Date</p>
            <p className="font-medium text-slate-900">
              {new Date(report.reportedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
