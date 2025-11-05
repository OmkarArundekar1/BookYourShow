import { getConnection } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { showId: string } }) {
  try {
    const connection = await getConnection()

    // Get total seats in the screen for this show
    const [screenInfo] = await connection.query(
      `SELECT s.total_seats 
       FROM screens s
       JOIN shows sh ON s.screen_id = sh.screen_id
       WHERE sh.show_id = ?`,
      [params.showId],
    )

    if (screenInfo.length === 0) {
      connection.end()
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    const totalSeats = screenInfo[0].total_seats

    // Get booked seats
    const [bookedSeats] = await connection.query(
      `SELECT bd.seat_number 
       FROM booking_details bd
       JOIN bookings b ON bd.booking_id = b.booking_id
       WHERE b.show_id = ? AND b.status = 'confirmed'`,
      [params.showId],
    )

    connection.end()

    const bookedSeatNumbers = bookedSeats.map((row: any) => row.seat_number)
    const availableSeats = generateSeatLayout(totalSeats, bookedSeatNumbers)

    return NextResponse.json({
      total_seats: totalSeats,
      booked_seats: bookedSeatNumbers,
      available_seats: availableSeats,
    })
  } catch (error) {
    console.error("Error fetching seats:", error)
    return NextResponse.json({ error: "Failed to fetch seats" }, { status: 500 })
  }
}

function generateSeatLayout(total: number, booked: string[]) {
  const rows = Math.ceil(total / 10)
  const seats: any[] = []
  let seatNumber = 1

  for (let i = 0; i < rows; i++) {
    const row = String.fromCharCode(65 + i)
    for (let j = 1; j <= 10 && seatNumber <= total; j++) {
      const seatCode = `${row}${j}`
      seats.push({
        id: seatCode,
        available: !booked.includes(seatCode),
      })
      seatNumber++
    }
  }

  return seats
}
