"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Download, Ticket } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface Booking {
  id: string
  movieTitle: string
  theaterName: string
  date: string
  time: string
  seats: string[]
  status: "upcoming" | "completed" | "cancelled"
  totalAmount: number
  bookingRef: string
  genre: string
}

const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: "1",
    movieTitle: "The Quantum Paradox",
    theaterName: "Cineplex Central",
    date: "Jan 20, 2025",
    time: "01:30 PM",
    seats: ["A5", "A6"],
    status: "upcoming",
    totalAmount: 27.98,
    bookingRef: "BMS12345678",
    genre: "Sci-Fi",
  },
  {
    id: "2",
    movieTitle: "Midnight Heist",
    theaterName: "Star Cinema Pavilion",
    date: "Jan 15, 2025",
    time: "08:00 PM",
    seats: ["C2", "C3", "C4"],
    status: "completed",
    totalAmount: 41.97,
    bookingRef: "BMS87654321",
    genre: "Thriller",
  },
  {
    id: "3",
    movieTitle: "Lost in Echoes",
    theaterName: "Premiere Screen Hall",
    date: "Jan 10, 2025",
    time: "05:00 PM",
    seats: ["B7"],
    status: "cancelled",
    totalAmount: 13.99,
    bookingRef: "BMS11223344",
    genre: "Drama",
  },
  {
    id: "4",
    movieTitle: "Rising Phoenix",
    theaterName: "Cineplex Central",
    date: "Dec 28, 2024",
    time: "07:00 PM",
    seats: ["D4", "D5"],
    status: "completed",
    totalAmount: 27.98,
    bookingRef: "BMS99887766",
    genre: "Action",
  },
]

function BookingCard({ booking }: { booking: Booking }) {
  const [showDetails, setShowDetails] = useState(false)

  const statusColors = {
    upcoming: "bg-green-500/20 text-green-500 border-green-500/30",
    completed: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    cancelled: "bg-red-500/20 text-red-500 border-red-500/30",
  }

  const statusLabels = {
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
  }

  return (
    <Card className="p-6 border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">{booking.movieTitle}</h3>
          <p className="text-sm text-muted-foreground mb-3">{booking.genre}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {booking.theaterName}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {booking.date}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              {booking.seats.length} seat{booking.seats.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[booking.status]}`}>
          {statusLabels[booking.status]}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary bg-transparent"
          onClick={() => setShowDetails(!showDetails)}
        >
          View Details
        </Button>
        {booking.status === "upcoming" && (
          <Button
            variant="outline"
            size="sm"
            className="border-border hover:bg-secondary text-red-500 hover:text-red-600 bg-transparent"
          >
            Cancel Booking
          </Button>
        )}
        <Button variant="outline" size="sm" className="border-border hover:bg-secondary bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          E-Ticket
        </Button>
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t border-border space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Show Time</p>
              <p className="font-semibold">{booking.time}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Seats</p>
              <p className="font-semibold">{booking.seats.join(", ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Booking Reference</p>
              <p className="font-mono text-xs font-semibold text-primary">{booking.bookingRef}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Total Amount</p>
              <p className="font-semibold">${booking.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {booking.status === "upcoming" && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm">
              <p className="text-foreground">
                Please arrive at the theater 15 minutes before the show starts. Bring a valid ID for verification.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")

  const upcomingBookings = SAMPLE_BOOKINGS.filter((b) => b.status === "upcoming")
  const completedBookings = SAMPLE_BOOKINGS.filter((b) => b.status === "completed")
  const cancelledBookings = SAMPLE_BOOKINGS.filter((b) => b.status === "cancelled")

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage all your movie ticket bookings</p>
        </div>
      </div>

      {/* Bookings Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 border border-border">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Completed ({completedBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            {/* Upcoming Bookings */}
            <TabsContent value="upcoming">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-6">No upcoming bookings</p>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90">Book a Movie</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Completed Bookings */}
            <TabsContent value="completed">
              {completedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No completed bookings</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {completedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Cancelled Bookings */}
            <TabsContent value="cancelled">
              {cancelledBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No cancelled bookings</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cancelledBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 BookMyShow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
