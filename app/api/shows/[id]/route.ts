import { executeQuery } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const query = "SELECT * FROM Show WHERE ShowID = ?"
    const results = await executeQuery(query, [id])

    if (!results || (Array.isArray(results) && results.length === 0)) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    return NextResponse.json({ show: Array.isArray(results) ? results[0] : results }, { status: 200 })
  } catch (error) {
    console.error("Show fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch show" }, { status: 500 })
  }
}
