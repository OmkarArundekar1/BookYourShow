"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Search } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"

const ALL_THEATERS = [
  {
    id: 1,
    name: "Cineplex Central",
    location: "Downtown Mall, Main St",
    city: "New York",
    distance: 2.5,
    rating: 4.5,
    screens: 12,
    address: "123 Main Street, Downtown",
  },
  {
    id: 2,
    name: "Star Cinema Pavilion",
    location: "Westside Complex, Avenue Rd",
    city: "New York",
    distance: 4.2,
    rating: 4.3,
    screens: 8,
    address: "456 Avenue Road, West Side",
  },
  {
    id: 3,
    name: "Premiere Screen Hall",
    location: "Tech Plaza, Innovation Blvd",
    city: "New York",
    distance: 5.1,
    rating: 4.7,
    screens: 10,
    address: "789 Innovation Boulevard, Tech Plaza",
  },
  {
    id: 4,
    name: "Galaxy Multiplex",
    location: "North Point, Harbor Dr",
    city: "New York",
    distance: 6.3,
    rating: 4.4,
    screens: 15,
    address: "321 Harbor Drive, North Point",
  },
]

export default function TheatersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("distance")

  const filteredTheaters = ALL_THEATERS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()),
  ).sort((a, b) => {
    if (sortBy === "distance") return a.distance - b.distance
    if (sortBy === "rating") return b.rating - a.rating
    return 0
  })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Browse Theaters</h1>
          <p className="text-muted-foreground mb-8">Find movie theaters near you</p>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search theaters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-secondary border border-border rounded-md text-foreground"
            >
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Theater List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredTheaters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No theaters found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTheaters.map((theater) => (
              <Link key={theater.id} href={`/shows/1`}>
                <Card className="p-6 border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{theater.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {theater.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/20 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm font-semibold">{theater.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-foreground">{theater.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {theater.distance} km away • {theater.screens} screens
                    </p>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">View Shows</Button>
                </Card>
              </Link>
            ))}
          </div>
        )}
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
