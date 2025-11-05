import { getConnection } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, genre, duration, rating, release_date } = await request.json()

    const connection = await getConnection()
    const [result] = await connection.query(
      "INSERT INTO movies (title, genre, duration, rating, release_date) VALUES (?, ?, ?, ?, ?)",
      [title, genre, duration, rating, release_date],
    )

    connection.end()
    return NextResponse.json({ movie_id: result.insertId, status: "created" }, { status: 201 })
  } catch (error) {
    console.error("Error creating movie:", error)
    return NextResponse.json({ error: "Failed to create movie" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { movie_id, title, genre, duration, rating } = await request.json()

    const connection = await getConnection()
    await connection.query("UPDATE movies SET title = ?, genre = ?, duration = ?, rating = ? WHERE movie_id = ?", [
      title,
      genre,
      duration,
      rating,
      movie_id,
    ])

    connection.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating movie:", error)
    return NextResponse.json({ error: "Failed to update movie" }, { status: 500 })
  }
}
