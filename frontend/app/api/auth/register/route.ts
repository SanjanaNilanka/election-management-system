import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, nic, phone, address, district, gnDivision, role } = body

    if (!name || !email || !password || !nic || !phone || !address || !district || !gnDivision) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const hashedPassword = await bcrypt.hash(password, 12)

    const userData = {
      name,
      email,
      password: hashedPassword,
      nic,
      phone,
      address,
      district,
      gnDivision,
      role: role || "citizen",
      createdAt: new Date(),
      status: "pending"
    }

    console.log("User registered:", userData)

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
