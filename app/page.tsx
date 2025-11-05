"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Menu, User, Ticket } from "lucide-react"
import Navbar from "@/components/navbar"
import MovieCarousel from "@/components/movie-carousel"
import MovieGrid from "@/components/movie-grid"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-primary/20 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/movie-theater-background.jpg')] bg-cover opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-4 text-balance">Book Your Movie Tickets Online</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-pretty">
            Discover new releases, browse showtimes, and book your favorite seats instantly
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-md">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search movies, theaters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 h-12"
              />
            </div>
            <Button className="h-12 px-6 bg-primary hover:bg-primary/90">Search</Button>
          </div>
        </div>
      </div>

      {/* Now Showing */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Now Showing</h2>
          <p className="text-muted-foreground">Catch the latest blockbusters</p>
        </div>
        <MovieCarousel />
      </div>

      {/* Coming Soon */}
      <div className="max-w-7xl mx-auto px-4 py-16 border-t border-border">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">Stay tuned for exciting releases</p>
        </div>
        <MovieGrid category="coming-soon" />
      </div>

      {/* Features */}
      <div className="bg-secondary/50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose BookMyShow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card border-border">
              <Ticket className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">Book tickets in seconds with our intuitive interface</p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <User className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-muted-foreground">Multiple payment options with industry-leading security</p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <Menu className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">Get instant notifications about seat availability</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 BookMyShow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
