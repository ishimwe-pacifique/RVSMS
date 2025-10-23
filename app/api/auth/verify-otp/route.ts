import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { createToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()
    console.log('[verify-otp] incoming', { email: (email || '').slice(0,40), hasOtp: !!otp })

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.otpHash || !user.otpExpires) {
      return NextResponse.json({ error: "No OTP found. Please login again." }, { status: 400 })
    }

    const now = new Date()
    if (new Date(user.otpExpires) < now) {
      return NextResponse.json({ error: "OTP expired. Please login again." }, { status: 400 })
    }

    // compare hashed OTP
    const bcrypt = await import('bcryptjs')
    const match = await bcrypt.compare(otp, user.otpHash)
    if (!match) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 })
    }

    // clear otpHash and expiry
    await db.collection("users").updateOne({ _id: new ObjectId(user._id) }, { $unset: { otpHash: "", otpExpires: "" } })

    const token = await createToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      sector: user.sector,
      district: user.district,
      province: user.province,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
