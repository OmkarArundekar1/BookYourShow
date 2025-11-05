"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface Show {
  id: number
  time: string
  format: string
  language: string
  availableSeats: number
}

interface Theater {
  id: number
  name: string
  location: string
  distance: number
  shows: Show[]
}

export default function TheaterList({
  theater,
  isSelected,
  onSelect,
}: {
  theater: Theater
  isSelected: boolean
  onSelect: (showId: number) => void
}) {
  return (
    <Card className={`p-6 border transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{theater.name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{theater.location}</span>
            <span className="text-xs ml-2 bg-secondary px-2 py-1 rounded">{theater.distance} km away</span>
          </div>
        </div>
      </div>

      {/* Show Timings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {theater.shows.map((show) => (
          <Button
            key={show.id}
            onClick={() => onSelect(show.id)}
            variant="outline"
            className={`h-auto py-3 flex flex-col gap-1 transition-all ${
              show.availableSeats === 0 ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-secondary"
            }`}
            disabled={show.availableSeats === 0}
          >
            <div className="text-sm font-semibold">{show.time}</div>
            <div className="text-xs text-muted-foreground">
              {show.format} • {show.language}
            </div>
            <div
              className={`text-xs font-semibold mt-1 ${
                show.availableSeats > 50
                  ? "text-green-400"
                  : show.availableSeats > 20
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {show.availableSeats} seats
            </div>
          </Button>
        ))}
      </div>
    </Card>
  )
}
