import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { sendOtpEmail } from "@/lib/email"
import { createToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check for superadmin credentials
    const superAdminEmail = process.env.SUPERADMIN_EMAIL
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD

    if (email === superAdminEmail && password === superAdminPassword) {
      // Direct login for superadmin without OTP
      const token = await createToken({
        id: "superadmin",
        email: superAdminEmail,
        name: "Super Admin",
        role: "super_admin",
        sector: "National",
        district: "All",
        province: "All",
      })

      const response = NextResponse.json({ success: true, isSuperAdmin: true })
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    }

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate OTP, hash it, store hash with expiry (10 minutes)
    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 1000 * 60 * 10) // 10 minutes
    const otpHash = await bcrypt.hash(otp, 10)

    await db.collection("users").updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { otpHash, otpExpires, lastOtpSentAt: new Date() } }
    )

    // Send OTP email (best-effort)
    try {
      await sendOtpEmail(user.email, otp, user.name || "")
    } catch (e) {
      console.error("Failed to send OTP email:", e)
      // continue — still respond that OTP was (attempted) sent so the front-end can show verification
    }

    return NextResponse.json({ success: true, otpSent: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
