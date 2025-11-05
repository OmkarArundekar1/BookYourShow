import { executeQuery } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const movieId = searchParams.get("movieId")
    const theaterId = searchParams.get("theaterId")
    const date = searchParams.get("date")

    let query =
      "SELECT s.*, m.Title as MovieTitle, t.Name as TheaterName FROM Show s JOIN Movie m ON s.MovieID = m.MovieID JOIN Theater t ON s.ScreenID IN (SELECT ScreenID FROM Screen WHERE TheaterID = t.TheaterID) WHERE 1=1"
    const params: any[] = []

    if (movieId) {
      query += " AND s.MovieID = ?"
      params.push(movieId)
    }

    if (theaterId) {
      query += " AND t.TheaterID = ?"
      params.push(theaterId)
    }

    if (date) {
      query += " AND DATE(s.ShowTime) = ?"
      params.push(date)
    }

    const results = await executeQuery(query, params)
    return NextResponse.json({ shows: results }, { status: 200 })
  } catch (error) {
    console.error("Shows fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch shows" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { movieId, screenId, showTime, price } = await req.json()

    const query = `
      INSERT INTO Show (MovieID, ScreenID, ShowTime, Price)
      VALUES (?, ?, ?, ?)
    `

    await executeQuery(query, [movieId, screenId, showTime, price])

    return NextResponse.json({ message: "Show created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Show creation error:", error)
    return NextResponse.json({ error: "Failed to create show" }, { status: 500 })
  }
}
