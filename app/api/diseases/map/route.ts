import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const diseaseType = searchParams.get("diseaseType")
    const severity = searchParams.get("severity")
    const province = searchParams.get("province")
    const district = searchParams.get("district")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const db = await getDatabase()

    // Build query
    const query: any = {}

    // Only get reports with location coordinates
    query["location.latitude"] = { $exists: true, $ne: null }
    query["location.longitude"] = { $exists: true, $ne: null }

    if (diseaseType && diseaseType !== "all") {
      query.diseaseType = diseaseType
    }

    if (severity && severity !== "all") {
      query.severity = severity
    }

    if (province && province !== "all") {
      query["location.province"] = province
    }

    if (district && district !== "all") {
      query["location.district"] = district
    }

    if (startDate || endDate) {
      query.diagnosisDate = {}
      if (startDate) {
        query.diagnosisDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.diagnosisDate.$lte = new Date(endDate)
      }
    }

    const reports = await db.collection("diseases").find(query).sort({ reportedDate: -1 }).limit(500).toArray()

    // Get statistics
    const stats = {
      total: reports.length,
      outbreaks: reports.filter((r) => r.isOutbreak).length,
      bySeverity: {
        mild: reports.filter((r) => r.severity === "mild").length,
        moderate: reports.filter((r) => r.severity === "moderate").length,
        severe: reports.filter((r) => r.severity === "severe").length,
        critical: reports.filter((r) => r.severity === "critical").length,
      },
      byType: {
        viral: reports.filter((r) => r.diseaseType === "viral").length,
        bacterial: reports.filter((r) => r.diseaseType === "bacterial").length,
        parasitic: reports.filter((r) => r.diseaseType === "parasitic").length,
        fungal: reports.filter((r) => r.diseaseType === "fungal").length,
        other: reports.filter((r) => r.diseaseType === "other").length,
      },
    }

    return NextResponse.json({
      reports: reports.map((report) => ({
        _id: report._id.toString(),
        reportId: report.reportId,
        diseaseName: report.diseaseName,
        diseaseType: report.diseaseType,
        severity: report.severity,
        isOutbreak: report.isOutbreak,
        affectedAnimalsCount: report.affectedAnimalsCount,
        location: report.location,
        diagnosisDate: report.diagnosisDate,
        reportedDate: report.reportedDate,
        outcome: report.outcome,
      })),
      stats,
    })
  } catch (error) {
    console.error("Get map data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
