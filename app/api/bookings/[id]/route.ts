import { getConnection } from "@/lib/db/mysql"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const connection = await getConnection()
    const [bookings] = await connection.query(
      `SELECT b.*, m.title, t.name as theater_name, s.show_time 
       FROM bookings b
       JOIN shows s ON b.show_id = s.show_id
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN theaters t ON sc.theater_id = t.theater_id
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [params.id, decoded.userId],
    )

    if (bookings.length === 0) {
      connection.end()
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Get booking details (seats)
    const [details] = await connection.query("SELECT seat_number FROM booking_details WHERE booking_id = ?", [
      params.id,
    ])

    connection.end()
    return NextResponse.json({ ...bookings[0], seats: details })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status } = await request.json()

    const connection = await getConnection()
    await connection.query("UPDATE bookings SET status = ? WHERE booking_id = ? AND user_id = ?", [
      status,
      params.id,
      decoded.userId,
    ])

    connection.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
