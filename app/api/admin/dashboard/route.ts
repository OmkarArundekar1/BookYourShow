import { getConnection } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const connection = await getConnection()

    // Get total bookings
    const [totalBookings] = await connection.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'")

    // Get total revenue
    const [totalRevenue] = await connection.query(
      "SELECT SUM(total_amount) as revenue FROM bookings WHERE status = 'confirmed'",
    )

    // Get top movies
    const [topMovies] = await connection.query(
      `SELECT m.title, COUNT(b.booking_id) as bookings, SUM(b.total_amount) as revenue
       FROM movies m
       JOIN shows s ON m.movie_id = s.movie_id
       JOIN bookings b ON s.show_id = b.show_id
       WHERE b.status = 'confirmed'
       GROUP BY m.movie_id
       ORDER BY revenue DESC
       LIMIT 5`,
    )

    // Get theater occupancy
    const [theaterOccupancy] = await connection.query(
      `SELECT t.name, COUNT(b.booking_id) as bookings, s.total_seats
       FROM theaters t
       JOIN screens sc ON t.theater_id = sc.theater_id
       JOIN shows sh ON sc.screen_id = sh.screen_id
       JOIN bookings b ON sh.show_id = b.show_id
       WHERE b.status = 'confirmed'
       GROUP BY t.theater_id
       ORDER BY bookings DESC`,
    )

    connection.end()

    return NextResponse.json({
      total_bookings: totalBookings[0].count,
      total_revenue: totalRevenue[0].revenue || 0,
      top_movies: topMovies,
      theater_occupancy: theaterOccupancy,
    })
  } catch (error) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
