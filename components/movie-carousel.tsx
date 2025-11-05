"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Movie {
  movie_id: number
  title: string
  rating: number
  genre: string
}

export default function MovieCarousel() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("/api/movies?status=now-showing")
        const data = await response.json()
        setMovies(data || [])
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("carousel")
    if (container) {
      const scrollAmount = 400
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  if (loading) return <div className="h-80 bg-secondary/50 rounded-lg animate-pulse" />

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 rounded-full"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <div id="carousel" className="flex gap-4 overflow-x-auto scroll-smooth pb-4" style={{ scrollBehavior: "smooth" }}>
        {movies.map((movie) => (
          <Link key={movie.movie_id} href={`/shows/${movie.movie_id}`}>
            <div className="flex-shrink-0 w-48 cursor-pointer hover:scale-105 transition-transform">
              <div className="bg-card rounded-lg overflow-hidden border border-border">
                <img
                  src={`/.jpg?height=300&width=200&query=${encodeURIComponent(movie.title)} movie poster`}
                  alt={movie.title}
                  className="w-full h-72 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{movie.genre}</span>
                    <span className="text-sm font-medium">{movie.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 rounded-full"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  )
}
