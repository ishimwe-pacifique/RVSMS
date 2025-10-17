import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"
import type { Animal } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const db = await getDatabase()

    // Generate unique animal ID
    const count = await db.collection("animals").countDocuments()
    const animalId = `ANM${String(count + 1).padStart(6, "0")}`

    const animal: Animal = {
      animalId,
      species: data.species,
      breed: data.breed,
      age: Number.parseInt(data.age),
      sex: data.sex,
      color: data.color,
      identificationMarks: data.identificationMarks,
      ownerName: data.ownerName,
      ownerContact: data.ownerContact,
      ownerAddress: data.ownerAddress,
      province: data.province,
      district: data.district,
      sector: data.sector,
      cell: data.cell,
      village: data.village,
      latitude: data.latitude ? Number.parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? Number.parseFloat(data.longitude) : undefined,
      healthStatus: "healthy",
      vaccinationHistory: [],
      registeredBy: user.id,
      registeredDate: new Date(),
      lastUpdated: new Date(),
    }

    const result = await db.collection("animals").insertOne(animal)

    return NextResponse.json({
      success: true,
      animal: { ...animal, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Animal registration error:", error)
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
    const species = searchParams.get("species")
    const healthStatus = searchParams.get("healthStatus")
    const sector = searchParams.get("sector")

    const db = await getDatabase()

    // Build query
    const query: any = {}

    // Filter by sector for veterinarians
    if (user.role === "veterinarian" && user.sector) {
      query.sector = user.sector
    }

    if (search) {
      query.$or = [
        { animalId: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } },
      ]
    }

    if (species) {
      query.species = species
    }

    if (healthStatus) {
      query.healthStatus = healthStatus
    }

    if (sector) {
      query.sector = sector
    }

    const animals = await db.collection("animals").find(query).sort({ registeredDate: -1 }).limit(100).toArray()

    return NextResponse.json({
      animals: animals.map((animal) => ({
        ...animal,
        _id: animal._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Get animals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
