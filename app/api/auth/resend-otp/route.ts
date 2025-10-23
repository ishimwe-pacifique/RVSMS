import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendOtpEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const db = await getDatabase()
    const user = await db.collection('users').findOne({ email })
    if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 })

    const now = new Date()
    // prevent rapid resends: require at least 30 seconds since last otpExpires-10min marker
    if (user.lastOtpSentAt && new Date(user.lastOtpSentAt) > new Date(Date.now() - 30 * 1000)) {
      return NextResponse.json({ error: 'Please wait before requesting a new code' }, { status: 429 })
    }

    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 1000 * 60 * 10)
    const bcrypt = await import('bcryptjs')
    const otpHash = await bcrypt.hash(otp, 10)

    await db.collection('users').updateOne({ _id: new ObjectId(user._id) }, { $set: { otpHash, otpExpires, lastOtpSentAt: new Date() } })

    try {
      await sendOtpEmail(user.email, otp, user.name || '')
    } catch (e) {
      console.error('Failed to send OTP email on resend:', e)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Resend OTP error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
