import { connectMongoDB } from "@/lib/db/mongodb"
import { User } from "@/lib/models/User"
import { hashPassword, generateToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB()

    const { name, email, password, phone } = await req.json()

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = hashPassword(password)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    })

    // Generate token
    const token = generateToken({ userId: user._id, email: user.email })

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
