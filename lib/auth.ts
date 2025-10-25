import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface User {
  id: string
  email: string
  name: string
  role: "veterinarian" | "admin" | "super_admin"
  sector?: string
  district?: string
  province?: string
  permissions?: string[]
}

export async function createToken(user: User): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.user as User
  } catch (error) {
    return null
  }
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  return await verifyToken(token)
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get("token")?.value

  if (!token) return null

  return await verifyToken(token)
}
