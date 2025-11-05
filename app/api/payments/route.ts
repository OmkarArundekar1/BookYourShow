import { getConnection } from "@/lib/db/mysql"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { booking_id, amount, payment_mode, payment_status } = await request.json()

    const connection = await getConnection()

    // Verify booking belongs to user
    const [booking] = await connection.query("SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?", [
      booking_id,
      decoded.userId,
    ])

    if (booking.length === 0) {
      connection.end()
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Insert payment
    const [result] = await connection.query(
      "INSERT INTO payments (booking_id, amount, payment_mode, payment_status) VALUES (?, ?, ?, ?)",
      [booking_id, amount, payment_mode, payment_status],
    )

    connection.end()
    return NextResponse.json({ payment_id: result.insertId, status: "success" }, { status: 201 })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
