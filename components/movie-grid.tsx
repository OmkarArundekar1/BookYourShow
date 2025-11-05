"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Movie {
  movie_id: number
  title: string
  rating: number | string
  genre: string
}

export default function MovieGrid({ category }: { category: string }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("/api/movies?status=coming-soon")
        const data = await response.json()
        setMovies(data || [])
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [category])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-secondary/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <Link key={movie.movie_id} href={`/shows/${movie.movie_id}`}>
          <div className="cursor-pointer hover:scale-105 transition-transform">
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
                  <span className="text-xs text-primary font-medium">{movie.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
