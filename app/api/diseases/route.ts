import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"
import type { DiseaseReport } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const db = await getDatabase()

    // Verify animal exists
    const animal = await db.collection("animals").findOne({ _id: new ObjectId(data.animalId) })

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 })
    }

    // Generate unique report ID
    const count = await db.collection("diseases").countDocuments()
    const reportId = `DIS${String(count + 1).padStart(6, "0")}`

    const diseaseReport: DiseaseReport = {
      reportId,
      animalId: data.animalId,
      animalDetails: {
        species: animal.species,
        breed: animal.breed,
        age: animal.age,
      },
      diseaseName: data.diseaseName,
      diseaseType: data.diseaseType,
      symptoms: data.symptoms,
      severity: data.severity,
      diagnosisDate: new Date(data.diagnosisDate),
      diagnosisMethod: data.diagnosisMethod,
      treatmentProvided: data.treatmentProvided,
      outcome: data.outcome || "ongoing",
      location: {
        province: animal.province,
        district: animal.district,
        sector: animal.sector,
        cell: animal.cell,
        village: animal.village,
        latitude: animal.latitude,
        longitude: animal.longitude,
      },
      reportedBy: user.id,
      reportedDate: new Date(),
      isOutbreak: data.isOutbreak || false,
      affectedAnimalsCount: data.affectedAnimalsCount ? Number.parseInt(data.affectedAnimalsCount) : 1,
      notes: data.notes,
    }

    const result = await db.collection("diseases").insertOne(diseaseReport)

    // Update animal health status
    await db.collection("animals").updateOne(
      { _id: new ObjectId(data.animalId) },
      {
        $set: {
          healthStatus: data.outcome === "recovered" ? "recovered" : "sick",
          lastUpdated: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      report: { ...diseaseReport, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Disease report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const diseaseType = searchParams.get("diseaseType")
    const severity = searchParams.get("severity")
    const sector = searchParams.get("sector")
    const isOutbreak = searchParams.get("isOutbreak")

    const db = await getDatabase()

    // Build query
    const query: any = {}

    // Filter by sector for veterinarians
    if (user.role === "veterinarian" && user.sector) {
      query["location.sector"] = user.sector
    }

    if (search) {
      query.$or = [
        { reportId: { $regex: search, $options: "i" } },
        { diseaseName: { $regex: search, $options: "i" } },
        { animalId: { $regex: search, $options: "i" } },
      ]
    }

    if (diseaseType) {
      query.diseaseType = diseaseType
    }

    if (severity) {
      query.severity = severity
    }

    if (sector) {
      query["location.sector"] = sector
    }

    if (isOutbreak === "true") {
      query.isOutbreak = true
    }

    const reports = await db.collection("diseases").find(query).sort({ reportedDate: -1 }).limit(100).toArray()

    return NextResponse.json({
      reports: reports.map((report) => ({
        ...report,
        _id: report._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Get disease reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
