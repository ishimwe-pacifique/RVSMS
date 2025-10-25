import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Build query based on user role
    const animalQuery: any = {}
    const diseaseQuery: any = {}

    if (user.role === "veterinarian" && user.sector) {
      animalQuery.sector = user.sector
      diseaseQuery["location.sector"] = user.sector
    }

    // Get animal statistics
    const totalAnimals = await db.collection("animals").countDocuments(animalQuery)
    const healthyAnimals = await db.collection("animals").countDocuments({ ...animalQuery, healthStatus: "healthy" })
    const sickAnimals = await db.collection("animals").countDocuments({ ...animalQuery, healthStatus: "sick" })
    const underTreatment = await db
      .collection("animals")
      .countDocuments({ ...animalQuery, healthStatus: "under_treatment" })

    // Get disease statistics
    const totalDiseases = await db.collection("diseases").countDocuments(diseaseQuery)
    const activeOutbreaks = await db.collection("diseases").countDocuments({ ...diseaseQuery, isOutbreak: true })

    // Get recent diseases (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentDiseases = await db
      .collection("diseases")
      .countDocuments({ ...diseaseQuery, reportedDate: { $gte: thirtyDaysAgo } })

    // Get animals by species
    const animalsBySpecies = await db
      .collection("animals")
      .aggregate([
        { $match: animalQuery },
        { $group: { _id: "$species", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // Get diseases by type
    const diseasesByType = await db
      .collection("diseases")
      .aggregate([
        { $match: diseaseQuery },
        { $group: { _id: "$diseaseType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // Get diseases by severity
    const diseasesBySeverity = await db
      .collection("diseases")
      .aggregate([{ $match: diseaseQuery }, { $group: { _id: "$severity", count: { $sum: 1 } } }])
      .toArray()

    // Get disease trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const diseaseTrends = await db
      .collection("diseases")
      .aggregate([
        { $match: { ...diseaseQuery, reportedDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$reportedDate" },
              month: { $month: "$reportedDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray()

    // Get top diseases
    const topDiseases = await db
      .collection("diseases")
      .aggregate([
        { $match: diseaseQuery },
        { $group: { _id: "$diseaseName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray()

    // Get recent activity
    const recentAnimals = await db
      .collection("animals")
      .find(animalQuery)
      .sort({ registeredDate: -1 })
      .limit(5)
      .toArray()

    const recentDiseaseReports = await db
      .collection("diseases")
      .find(diseaseQuery)
      .sort({ reportedDate: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      stats: {
        totalAnimals,
        healthyAnimals,
        sickAnimals,
        underTreatment,
        totalDiseases,
        activeOutbreaks,
        recentDiseases,
      },
      charts: {
        animalsBySpecies: animalsBySpecies.map((item) => ({
          name: item._id,
          value: item.count,
        })),
        diseasesByType: diseasesByType.map((item) => ({
          name: item._id,
          value: item.count,
        })),
        diseasesBySeverity: diseasesBySeverity.map((item) => ({
          name: item._id,
          value: item.count,
        })),
        diseaseTrends: diseaseTrends.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          count: item.count,
        })),
        topDiseases: topDiseases.map((item) => ({
          name: item._id,
          value: item.count,
        })),
      },
      recentActivity: {
        animals: recentAnimals.map((animal) => ({
          _id: animal._id.toString(),
          animalId: animal.animalId,
          species: animal.species,
          breed: animal.breed,
          ownerName: animal.ownerName,
          registeredDate: animal.registeredDate,
          location: {
            province: animal.province,
            district: animal.district,
            sector: animal.sector,
          },
        })),
        diseases: recentDiseaseReports.map((disease) => ({
          _id: disease._id.toString(),
          reportId: disease.reportId,
          diseaseName: disease.diseaseName,
          severity: disease.severity,
          location: disease.location,
          reportedDate: disease.reportedDate,
        })),
      },
    })
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
