import { getConnection } from "@/lib/db/mysql"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [decoded.userId],
    )

    connection.end()
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

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

    const { show_id, seats } = await request.json()

    if (!show_id || !seats || seats.length === 0) {
      return NextResponse.json({ error: "Invalid show_id or seats" }, { status: 400 })
    }

    const connection = await getConnection()

    // Get show details and ticket price
    const [shows] = await connection.query("SELECT price FROM shows WHERE show_id = ?", [show_id])

    if (shows.length === 0) {
      connection.end()
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    const ticketPrice = shows[0].price
    const totalAmount = ticketPrice * seats.length

    // Create booking
    const [result] = await connection.query(
      "INSERT INTO bookings (user_id, show_id, total_amount, status) VALUES (?, ?, ?, ?)",
      [decoded.userId, show_id, totalAmount, "confirmed"],
    )

    const bookingId = result.insertId

    // Add booking details for each seat
    for (const seat of seats) {
      await connection.query("INSERT INTO booking_details (booking_id, seat_number) VALUES (?, ?)", [bookingId, seat])
    }

    connection.end()
    return NextResponse.json({ booking_id: bookingId, total_amount: totalAmount }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
