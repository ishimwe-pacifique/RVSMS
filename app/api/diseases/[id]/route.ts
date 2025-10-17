import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUser } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const report = await db.collection("diseases").findOne({ _id: new ObjectId(id) })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Get animal details
    const animal = await db.collection("animals").findOne({ _id: new ObjectId(report.animalId) })

    return NextResponse.json({
      report: {
        ...report,
        _id: report._id.toString(),
      },
      animal: animal
        ? {
            ...animal,
            _id: animal._id.toString(),
          }
        : null,
    })
  } catch (error) {
    console.error("Get disease report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    const db = await getDatabase()

    const result = await db.collection("diseases").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updates,
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // If outcome is updated, update animal health status
    if (updates.outcome) {
      const report = await db.collection("diseases").findOne({ _id: new ObjectId(id) })
      if (report) {
        let healthStatus = "sick"
        if (updates.outcome === "recovered") healthStatus = "recovered"
        else if (updates.outcome === "deceased") healthStatus = "deceased"
        else if (updates.outcome === "under_treatment") healthStatus = "under_treatment"

        await db.collection("animals").updateOne(
          { _id: new ObjectId(report.animalId) },
          {
            $set: {
              healthStatus,
              lastUpdated: new Date(),
            },
          },
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update disease report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
