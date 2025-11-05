"use client"

import { useState, useEffect } from "react"

interface SeatMapProps {
  selectedSeats: string[]
  onSeatSelect: (seatId: string) => void
  showId: string
}

interface Seat {
  id: string
  available: boolean
}

export default function SeatMap({ selectedSeats, onSeatSelect, showId }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch(`/api/seats/${showId}`)
        const data = await response.json()
        setSeats(data.available_seats || [])
      } catch (error) {
        console.error("Error fetching seats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
  }, [showId])

  if (loading) return <div className="h-64 bg-secondary/50 rounded-lg animate-pulse" />

  const rows = ["A", "B", "C", "D", "E", "F"]
  const seatsPerRow = 10

  const getSeatStatus = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId)
    if (selectedSeats.includes(seatId)) return "selected"
    if (!seat?.available) return "booked"
    return "available"
  }

  const handleSeatClick = (seatId: string) => {
    const status = getSeatStatus(seatId)
    if (status === "available") {
      onSeatSelect(seatId)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Screen */}
      <div className="w-full">
        <div className="bg-gradient-to-b from-primary/30 to-primary/10 rounded-b-3xl py-2 px-4 text-center text-sm font-semibold text-muted-foreground">
          SCREEN
        </div>
      </div>

      {/* Seats */}
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-6 text-right font-semibold text-muted-foreground">{row}</span>
            <div className="flex gap-2">
              {Array.from({ length: seatsPerRow }).map((_, index) => {
                const seatNumber = index + 1
                const seatId = `${row}${seatNumber}`
                const status = getSeatStatus(seatId)

                return (
                  <button
                    key={seatId}
                    onClick={() => handleSeatClick(seatId)}
                    disabled={status === "booked"}
                    className={`w-8 h-8 rounded transition-all transform hover:scale-110 ${
                      status === "available"
                        ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                        : status === "selected"
                          ? "bg-primary hover:bg-primary/90 scale-110 cursor-pointer"
                          : "bg-muted cursor-not-allowed opacity-50"
                    }`}
                    title={seatId}
                  >
                    <span className="text-xs font-bold text-foreground opacity-70">{seatNumber}</span>
                  </button>
                )
              })}
            </div>
            <span className="w-6 text-left font-semibold text-muted-foreground">{row}</span>
          </div>
        ))}
      </div>

      {/* Row Labels */}
      <div className="flex gap-2 ml-9">
        {Array.from({ length: seatsPerRow }).map((_, index) => (
          <div key={index} className="w-8 text-center text-xs text-muted-foreground font-semibold">
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
