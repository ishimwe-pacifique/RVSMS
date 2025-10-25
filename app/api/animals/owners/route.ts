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
    const query: any = {}
    if (user.role === "veterinarian" && user.sector) {
      query.sector = user.sector
    }

    // Get unique owner names
    const owners = await db
      .collection("animals")
      .distinct("ownerName", query)

    return NextResponse.json({ owners: owners.sort() })
  } catch (error) {
    console.error("Failed to fetch owners:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}