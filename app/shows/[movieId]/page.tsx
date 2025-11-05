"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import TheaterList from "@/components/theater-list"

const MOVIE_DETAILS = {
  1: {
    title: "The Quantum Paradox",
    rating: 8.5,
    genre: "Sci-Fi",
    duration: 148,
    language: "English",
    releaseDate: "2025-01-15",
    description:
      "A mind-bending journey through parallel dimensions where a scientist discovers the truth about reality.",
    cast: ["Tom Hardy", "Tilda Swinton", "John Boyega"],
    director: "Christopher Nolan",
    censor: "UA",
    image: "/sci-fi-movie-poster.jpg",
  },
}

const SAMPLE_THEATERS = [
  {
    id: 1,
    name: "Cineplex Central",
    location: "Downtown Mall, Main St",
    distance: 2.5,
    shows: [
      { id: 101, time: "10:00 AM", format: "2D", language: "English", availableSeats: 145 },
      { id: 102, time: "01:30 PM", format: "3D", language: "English", availableSeats: 12 },
      { id: 103, time: "05:00 PM", format: "2D", language: "English", availableSeats: 89 },
      { id: 104, time: "08:00 PM", format: "3D", language: "English", availableSeats: 5 },
    ],
  },
  {
    id: 2,
    name: "Star Cinema Pavilion",
    location: "Westside Complex, Avenue Rd",
    distance: 4.2,
    shows: [
      { id: 201, time: "09:30 AM", format: "2D", language: "English", availableSeats: 67 },
      { id: 202, time: "12:45 PM", format: "3D", language: "English", availableSeats: 28 },
      { id: 203, time: "04:15 PM", format: "2D", language: "English", availableSeats: 102 },
      { id: 204, time: "07:30 PM", format: "3D", language: "English", availableSeats: 8 },
    ],
  },
  {
    id: 3,
    name: "Premiere Screen Hall",
    location: "Tech Plaza, Innovation Blvd",
    distance: 5.1,
    shows: [
      { id: 301, time: "11:00 AM", format: "2D", language: "English", availableSeats: 134 },
      { id: 302, time: "02:00 PM", format: "3D", language: "English", availableSeats: 19 },
      { id: 303, time: "05:30 PM", format: "2D", language: "English", availableSeats: 76 },
      { id: 304, time: "09:00 PM", format: "3D", language: "English", availableSeats: 3 },
    ],
  },
]

export default function ShowSelectionPage({ params }: { params: { movieId: string } }) {
  const movieId = Number.parseInt(params.movieId)
  const movie = MOVIE_DETAILS[movieId as keyof typeof MOVIE_DETAILS]
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null)

  if (!movie) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-muted-foreground">Movie not found</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Movie Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="flex items-center gap-2 text-primary mb-6 hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src={movie.image || "/placeholder.svg"} alt={movie.title} className="w-full rounded-lg" />
            </div>
            <div className="md:col-span-3">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">{movie.genre}</span>
                <span className="text-sm bg-secondary text-foreground px-3 py-1 rounded-full">{movie.censor}</span>
                <span className="text-sm bg-secondary text-foreground px-3 py-1 rounded-full">
                  {movie.duration} min
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <p className="flex items-center gap-2">
                  <span className="font-semibold min-w-24">Director:</span>
                  <span className="text-muted-foreground">{movie.director}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold min-w-24">Language:</span>
                  <span className="text-muted-foreground">{movie.language}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold min-w-24">Rating:</span>
                  <span className="text-muted-foreground">{movie.rating}/10</span>
                </p>
              </div>

              <p className="text-foreground leading-relaxed mb-6">{movie.description}</p>

              <p className="text-sm">
                <span className="font-semibold">Cast:</span>
                <span className="text-muted-foreground ml-2">{movie.cast.join(", ")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-lg font-semibold mb-4">Select Date</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() + i)
              const dateStr = date.toISOString().split("T")[0]
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
              const dayNum = date.getDate()

              return (
                <Button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  variant={selectedDate === dateStr ? "default" : "outline"}
                  className={`flex-shrink-0 ${
                    selectedDate === dateStr ? "bg-primary hover:bg-primary/90" : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs">{dayName}</div>
                    <div className="text-sm font-semibold">{dayNum}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Theater List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Select Theater & Show</h2>
        <div className="space-y-6">
          {SAMPLE_THEATERS.map((theater) => (
            <TheaterList
              key={theater.id}
              theater={theater}
              isSelected={selectedTheater === theater.id}
              onSelect={(showId) => {
                setSelectedTheater(theater.id)
                window.location.href = `/seats/${showId}`
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 BookMyShow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
