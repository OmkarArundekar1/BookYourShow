import { executeQuery } from "@/lib/db/mysql"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const results = await executeQuery("SELECT * FROM Theater LIMIT 50")
    return NextResponse.json({ theaters: results }, { status: 200 })
  } catch (error) {
    console.error("Theaters fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch theaters" }, { status: 500 })
  }
}
