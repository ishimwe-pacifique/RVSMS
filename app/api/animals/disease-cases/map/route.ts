import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const db = await getDatabase()
    
    // Build MongoDB query based on filters
    const query: any = {}
    
    const species = searchParams.get("species")
    const severity = searchParams.get("severity")
    const status = searchParams.get("status")
    const province = searchParams.get("province")
    const district = searchParams.get("district")
    const diseaseType = searchParams.get("diseaseType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (species && species !== "all") {
      query["animalDetails.species"] = species
    }
    if (severity && severity !== "all") {
      query.severity = severity
    }
    if (status && status !== "all") {
      query.outcome = status === "active" ? "ongoing" : status
    }
    if (province && province !== "all") {
      query["location.province"] = province
    }
    if (district && district !== "all") {
      query["location.district"] = district
    }
    if (diseaseType && diseaseType !== "all") {
      query.diseaseType = diseaseType
    }
    if (startDate || endDate) {
      query.diagnosisDate = {}
      if (startDate) query.diagnosisDate.$gte = new Date(startDate)
      if (endDate) query.diagnosisDate.$lte = new Date(endDate)
    }

    // Fetch disease reports with populated animal data
    const reports = await db.collection("diseases")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "animals",
            localField: "animalId",
            foreignField: "_id",
            as: "animal",
            pipeline: [
              {
                $project: {
                  animalId: 1,
                  species: 1,
                  breed: 1,
                  ownerName: 1,
                  ownerContact: 1
                }
              }
            ]
          }
        },
        { $unwind: { path: "$animal", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: { $toString: "$_id" },
            caseId: "$reportId",
            animal: {
              _id: { $toString: "$animal._id" },
              tagNumber: "$animal.animalId",
              species: "$animal.species",
              breed: "$animal.breed",
              owner: {
                name: "$animal.ownerName",
                phone: "$animal.ownerContact"
              }
            },
            disease: {
              name: "$diseaseName",
              type: "$diseaseType",
              severity: "$severity"
            },
            location: "$location",
            diagnosisDate: "$diagnosisDate",
            reportedDate: "$reportedDate",
            veterinarian: {
              name: "$reportedBy",
              license: "VET-LICENSE"
            },
            symptoms: "$symptoms",
            treatment: "$treatmentProvided",
            status: {
              $switch: {
                branches: [
                  { case: { $eq: ["$outcome", "ongoing"] }, then: "active" },
                  { case: { $eq: ["$outcome", "under_treatment"] }, then: "treated" },
                  { case: { $eq: ["$outcome", "recovered"] }, then: "recovered" },
                  { case: { $eq: ["$outcome", "deceased"] }, then: "deceased" }
                ],
                default: "active"
              }
            },
            isOutbreak: "$isOutbreak",
            notes: "$notes"
          }
        }
      ])
      .toArray()

    // Calculate statistics
    const stats = {
      totalCases: reports.length,
      activeOutbreaks: reports.filter(r => r.isOutbreak).length,
      affectedAnimals: reports.length,
      affectedLocations: new Set(reports.map(r => r.location?.sector).filter(Boolean)).size,
      bySeverity: {
        mild: reports.filter(r => r.disease?.severity === "mild").length,
        moderate: reports.filter(r => r.disease?.severity === "moderate").length,
        severe: reports.filter(r => r.disease?.severity === "severe").length,
        critical: reports.filter(r => r.disease?.severity === "critical").length,
      },
      bySpecies: {
        cattle: reports.filter(r => r.animal?.species === "cattle").length,
        goats: reports.filter(r => r.animal?.species === "goats").length,
        sheep: reports.filter(r => r.animal?.species === "sheep").length,
        pigs: reports.filter(r => r.animal?.species === "pigs").length,
        poultry: reports.filter(r => r.animal?.species === "poultry").length,
        other: reports.filter(r => r.animal?.species && !["cattle", "goats", "sheep", "pigs", "poultry"].includes(r.animal.species)).length,
      },
      byStatus: {
        active: reports.filter(r => r.status === "active").length,
        treated: reports.filter(r => r.status === "treated").length,
        recovered: reports.filter(r => r.status === "recovered").length,
        deceased: reports.filter(r => r.status === "deceased").length,
      }
    }

    return NextResponse.json({
      success: true,
      cases: reports,
      stats
    })

  } catch (error) {
    console.error("Error fetching disease cases:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch disease cases" },
      { status: 500 }
    )
  }
}