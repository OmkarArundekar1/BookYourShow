import { getConnection } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection()

    const [bookings] = await connection.query(
      `SELECT b.*, u.name, u.email, m.title, t.name as theater_name, s.show_time
       FROM bookings b
       JOIN users u ON b.user_id = u.user_id
       JOIN shows s ON b.show_id = s.show_id
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN screens sc ON s.screen_id = sc.screen_id
       JOIN theaters t ON sc.theater_id = t.theater_id
       ORDER BY b.booking_date DESC`,
    )

    connection.end()
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { booking_id } = await request.json()

    const connection = await getConnection()
    await connection.query("UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?", [booking_id])

    connection.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
