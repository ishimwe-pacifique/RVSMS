import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUser()

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized - Super Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()

    // Get comprehensive statistics for all provinces
    const provinceStats = await db
      .collection("animals")
      .aggregate([
        {
          $group: {
            _id: "$province",
            totalAnimals: { $sum: 1 },
            healthyAnimals: { $sum: { $cond: [{ $eq: ["$healthStatus", "healthy"] }, 1, 0] } },
            sickAnimals: { $sum: { $cond: [{ $eq: ["$healthStatus", "sick"] }, 1, 0] } },
            underTreatment: { $sum: { $cond: [{ $eq: ["$healthStatus", "under_treatment"] }, 1, 0] } },
            recovered: { $sum: { $cond: [{ $eq: ["$healthStatus", "recovered"] }, 1, 0] } },
            deceased: { $sum: { $cond: [{ $eq: ["$healthStatus", "deceased"] }, 1, 0] } },
          },
        },
        { $sort: { totalAnimals: -1 } },
      ])
      .toArray()

    // Get disease statistics by province
    const diseaseStatsByProvince = await db
      .collection("diseases")
      .aggregate([
        {
          $group: {
            _id: "$location.province",
            totalDiseases: { $sum: 1 },
            activeOutbreaks: { $sum: { $cond: ["$isOutbreak", 1, 0] } },
            criticalCases: { $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] } },
            severeCases: { $sum: { $cond: [{ $eq: ["$severity", "severe"] }, 1, 0] } },
            moderateCases: { $sum: { $cond: [{ $eq: ["$severity", "moderate"] }, 1, 0] } },
            mildCases: { $sum: { $cond: [{ $eq: ["$severity", "mild"] }, 1, 0] } },
          },
        },
        { $sort: { totalDiseases: -1 } },
      ])
      .toArray()

    // Get district-level statistics
    const districtStats = await db
      .collection("animals")
      .aggregate([
        {
          $group: {
            _id: { province: "$province", district: "$district" },
            totalAnimals: { $sum: 1 },
            healthyAnimals: { $sum: { $cond: [{ $eq: ["$healthStatus", "healthy"] }, 1, 0] } },
            sickAnimals: { $sum: { $cond: [{ $eq: ["$healthStatus", "sick"] }, 1, 0] } },
          },
        },
        { $sort: { "_id.province": 1, "_id.district": 1 } },
      ])
      .toArray()

    // Get sector-level statistics
    const sectorStats = await db
      .collection("animals")
      .aggregate([
        {
          $group: {
            _id: { province: "$province", district: "$district", sector: "$sector" },
            totalAnimals: { $sum: 1 },
            healthyAnimals: { $sum: { $cond: [{ $eq: ["$healthStatus", "healthy"] }, 1, 0] } },
            sickAnimals: { $sum: { $cond: [{ $eq: ["$healthStatus", "sick"] }, 1, 0] } },
            species: { $push: "$species" },
          },
        },
        { $sort: { "_id.province": 1, "_id.district": 1, "_id.sector": 1 } },
      ])
      .toArray()

    // Get disease trends over time (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const diseaseTrends = await db
      .collection("diseases")
      .aggregate([
        { $match: { reportedDate: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$reportedDate" },
              month: { $month: "$reportedDate" },
              province: "$location.province",
            },
            count: { $sum: 1 },
            outbreaks: { $sum: { $cond: ["$isOutbreak", 1, 0] } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.province": 1 } },
      ])
      .toArray()

    // Get top diseases by province
    const topDiseasesByProvince = await db
      .collection("diseases")
      .aggregate([
        {
          $group: {
            _id: { province: "$location.province", disease: "$diseaseName" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.province",
            diseases: {
              $push: {
                name: "$_id.disease",
                count: "$count",
              },
            },
          },
        },
        {
          $addFields: {
            diseases: { $slice: [{ $sortArray: { input: "$diseases", sortBy: { count: -1 } } }, 5] },
          },
        },
      ])
      .toArray()

    // Get animal species distribution by province
    const speciesDistribution = await db
      .collection("animals")
      .aggregate([
        {
          $group: {
            _id: { province: "$province", species: "$species" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.province",
            species: {
              $push: {
                name: "$_id.species",
                count: "$count",
              },
            },
            totalAnimals: { $sum: "$count" },
          },
        },
        { $sort: { totalAnimals: -1 } },
      ])
      .toArray()

    // Combine province data
    const combinedProvinceData = provinceStats.map((province) => {
      const diseaseData = diseaseStatsByProvince.find((d) => d._id === province._id) || {
        totalDiseases: 0,
        activeOutbreaks: 0,
        criticalCases: 0,
        severeCases: 0,
        moderateCases: 0,
        mildCases: 0,
      }

      const speciesData = speciesDistribution.find((s) => s._id === province._id) || { species: [] }
      const topDiseases = topDiseasesByProvince.find((t) => t._id === province._id) || { diseases: [] }

      return {
        province: province._id,
        animals: {
          total: province.totalAnimals,
          healthy: province.healthyAnimals,
          sick: province.sickAnimals,
          underTreatment: province.underTreatment,
          recovered: province.recovered,
          deceased: province.deceased,
          healthRate: province.totalAnimals > 0 ? Math.round((province.healthyAnimals / province.totalAnimals) * 100) : 0,
        },
        diseases: {
          total: diseaseData.totalDiseases,
          activeOutbreaks: diseaseData.activeOutbreaks,
          critical: diseaseData.criticalCases,
          severe: diseaseData.severeCases,
          moderate: diseaseData.moderateCases,
          mild: diseaseData.mildCases,
        },
        species: speciesData.species,
        topDiseases: topDiseases.diseases,
      }
    })

    return NextResponse.json({
      overview: {
        totalAnimals: provinceStats.reduce((sum, p) => sum + p.totalAnimals, 0),
        totalDiseases: diseaseStatsByProvince.reduce((sum, d) => sum + d.totalDiseases, 0),
        totalOutbreaks: diseaseStatsByProvince.reduce((sum, d) => sum + d.activeOutbreaks, 0),
        totalProvinces: provinceStats.length,
      },
      provinces: combinedProvinceData,
      districts: districtStats.map((d) => ({
        province: d._id.province,
        district: d._id.district,
        totalAnimals: d.totalAnimals,
        healthyAnimals: d.healthyAnimals,
        sickAnimals: d.sickAnimals,
        healthRate: d.totalAnimals > 0 ? Math.round((d.healthyAnimals / d.totalAnimals) * 100) : 0,
      })),
      sectors: sectorStats.map((s) => ({
        province: s._id.province,
        district: s._id.district,
        sector: s._id.sector,
        totalAnimals: s.totalAnimals,
        healthyAnimals: s.healthyAnimals,
        sickAnimals: s.sickAnimals,
        healthRate: s.totalAnimals > 0 ? Math.round((s.healthyAnimals / s.totalAnimals) * 100) : 0,
        species: s.species,
      })),
      trends: diseaseTrends.map((t) => ({
        date: `${t._id.year}-${String(t._id.month).padStart(2, "0")}`,
        province: t._id.province,
        diseases: t.count,
        outbreaks: t.outbreaks,
      })),
    })
  } catch (error) {
    console.error("Super admin analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}