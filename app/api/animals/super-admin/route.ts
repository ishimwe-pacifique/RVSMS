import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const province = searchParams.get("province")
    const district = searchParams.get("district")
    const search = searchParams.get("search")

    const db = await getDatabase()
    
    // Build filter query
    const filter: any = {}
    
    if (province && province !== "all") {
      filter["location.province"] = province
    }
    
    if (district && district !== "all") {
      filter["location.district"] = district
    }
    
    if (search) {
      filter.$or = [
        { tagNumber: { $regex: search, $options: "i" } },
        { species: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } },
        { "owner.name": { $regex: search, $options: "i" } },
        { "owner.phone": { $regex: search, $options: "i" } }
      ]
    }

    // Get total count
    const total = await db.collection("animals").countDocuments(filter)
    
    // Get paginated results
    const animals = await db.collection("animals")
      .find(filter)
      .sort({ registrationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      animals,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    })
  } catch (error) {
    console.error("Super admin animals fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}