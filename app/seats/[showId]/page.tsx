"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import SeatMap from "@/components/seat-map"

const SHOW_INFO = {
  101: {
    movieTitle: "The Quantum Paradox",
    theaterName: "Cineplex Central",
    showTime: "01:30 PM",
    date: "2025-01-20",
    price: 12.99,
  },
}

export default function SeatsPage({ params }: { params: { showId: string } }) {
  const showId = Number.parseInt(params.showId)
  const showInfo = SHOW_INFO[showId as keyof typeof SHOW_INFO] || {
    movieTitle: "Movie Title",
    theaterName: "Theater Name",
    showTime: "Show Time",
    date: "Date",
    price: 12.99,
  }

  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => (prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]))
  }

  const totalPrice = selectedSeats.length * showInfo.price

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Seat Selection */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border">
              <h1 className="text-2xl font-bold mb-2">{showInfo.movieTitle}</h1>
              <p className="text-muted-foreground mb-8">
                {showInfo.theaterName} • {showInfo.showTime} • {showInfo.date}
              </p>

              <SeatMap selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="p-6 border-border sticky top-32 space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-4">Booking Summary</h2>
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Movie</span>
                    <span className="font-semibold text-right">{showInfo.movieTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Theater</span>
                    <span className="font-semibold text-right">{showInfo.theaterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-semibold text-right text-sm">{showInfo.showTime}</span>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              <div>
                <h3 className="font-semibold mb-3">Selected Seats</h3>
                {selectedSeats.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No seats selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSeats.map((seat) => (
                      <span key={seat} className="bg-primary/20 text-primary px-3 py-1 rounded text-sm font-semibold">
                        {seat}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {selectedSeats.length} × ${showInfo.price.toFixed(2)}
                </p>
              </div>

              {/* Pricing */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="font-semibold">${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-border">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">${(totalPrice * 1.08).toFixed(2)}</span>
                </div>
              </div>

              <Link href={`/checkout?show=${showId}&seats=${selectedSeats.join(",")}`}>
                <Button className="w-full bg-primary hover:bg-primary/90 h-12" disabled={selectedSeats.length === 0}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
              </Link>

              {/* Legend */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="text-xs font-semibold mb-3">Seat Legend</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span className="text-xs text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <span className="text-xs text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-dashed border-foreground rounded"></div>
                  <span className="text-xs text-muted-foreground">Disabled</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
