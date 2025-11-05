import { executeQuery } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const results = await executeQuery("SELECT * FROM Movie LIMIT 20")
    return NextResponse.json({ movies: results }, { status: 200 })
  } catch (error) {
    console.error("Movies fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, genre, duration, rating, poster_url } = await req.json()

    const query = `
      INSERT INTO Movie (Title, Genre, Duration, Rating, PosterURL)
      VALUES (?, ?, ?, ?, ?)
    `

    await executeQuery(query, [title, genre, duration, rating, poster_url])

    return NextResponse.json({ message: "Movie created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Movie creation error:", error)
    return NextResponse.json({ error: "Failed to create movie" }, { status: 500 })
  }
}
