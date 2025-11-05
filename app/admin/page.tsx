"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, TrendingUp, Calendar, Plus, Edit2, Trash2, Search } from "lucide-react"
import Link from "next/link"

const DASHBOARD_STATS = [
  { label: "Total Bookings", value: "2,451", change: "+12%", icon: Calendar },
  { label: "Total Revenue", value: "$45,230", change: "+8%", icon: TrendingUp },
  { label: "Active Users", value: "1,823", change: "+5%", icon: Users },
  { label: "Occupancy Rate", value: "78%", change: "+3%", icon: BarChart3 },
]

const SAMPLE_MOVIES = [
  { id: 1, title: "The Quantum Paradox", shows: 24, revenue: "$8,940", bookings: 687 },
  { id: 2, title: "Midnight Heist", shows: 18, revenue: "$7,230", bookings: 542 },
  { id: 3, title: "Lost in Echoes", shows: 12, revenue: "$4,560", bookings: 324 },
]

const SAMPLE_THEATERS = [
  { id: 1, name: "Cineplex Central", screens: 12, totalCapacity: 3600, bookedSeats: 2856 },
  { id: 2, name: "Star Cinema Pavilion", screens: 8, totalCapacity: 2400, bookedSeats: 1872 },
  { id: 3, name: "Premiere Screen Hall", screens: 10, totalCapacity: 3000, bookedSeats: 2340 },
]

const RECENT_BOOKINGS = [
  { id: "BMS001", customer: "John Doe", movie: "The Quantum Paradox", amount: "$25.98", status: "confirmed" },
  { id: "BMS002", customer: "Jane Smith", movie: "Midnight Heist", amount: "$38.97", status: "confirmed" },
  { id: "BMS003", customer: "Mike Johnson", movie: "Lost in Echoes", amount: "$12.99", status: "pending" },
  { id: "BMS004", customer: "Sarah Williams", movie: "The Quantum Paradox", amount: "$51.96", status: "confirmed" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <main className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            BookMyShow Admin
          </Link>
          <Button variant="outline" className="border-border hover:bg-secondary bg-transparent">
            Logout
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {DASHBOARD_STATS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-6 border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <p className="text-green-400 text-xs mt-2">{stat.change}</p>
                  </div>
                  <Icon className="w-8 h-8 text-primary opacity-20" />
                </div>
              </Card>
            )
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50 border border-border mb-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="movies"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Movies
            </TabsTrigger>
            <TabsTrigger
              value="theaters"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Theaters
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="p-6 border-border">
              <h2 className="text-lg font-bold mb-6">Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Booking ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Movie</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_BOOKINGS.map((booking) => (
                      <tr key={booking.id} className="border-b border-border hover:bg-secondary/30 transition">
                        <td className="py-3 px-4 text-sm font-mono text-primary">{booking.id}</td>
                        <td className="py-3 px-4 text-sm">{booking.customer}</td>
                        <td className="py-3 px-4 text-sm">{booking.movie}</td>
                        <td className="py-3 px-4 text-sm font-semibold">{booking.amount}</td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Movies Tab */}
          <TabsContent value="movies">
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Movie
                </Button>
              </div>

              <Card className="p-6 border-border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Shows</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Bookings</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_MOVIES.map((movie) => (
                      <tr key={movie.id} className="border-b border-border hover:bg-secondary/30 transition">
                        <td className="py-3 px-4 text-sm font-semibold">{movie.title}</td>
                        <td className="py-3 px-4 text-sm">{movie.shows}</td>
                        <td className="py-3 px-4 text-sm font-semibold">{movie.revenue}</td>
                        <td className="py-3 px-4 text-sm">{movie.bookings}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </TabsContent>

          {/* Theaters Tab */}
          <TabsContent value="theaters">
            <div className="space-y-6">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Theater
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SAMPLE_THEATERS.map((theater) => (
                  <Card key={theater.id} className="p-6 border-border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{theater.name}</h3>
                        <p className="text-sm text-muted-foreground">{theater.screens} screens</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Capacity</span>
                        <span className="font-semibold">{theater.totalCapacity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Booked Seats</span>
                        <span className="font-semibold">{theater.bookedSeats}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-semibold text-green-400">
                          {Math.round((theater.bookedSeats / theater.totalCapacity) * 100)}%
                        </span>
                      </div>
                      <div className="bg-secondary/50 rounded-full h-2 mt-4 overflow-hidden">
                        <div
                          className="bg-primary h-full"
                          style={{
                            width: `${(theater.bookedSeats / theater.totalCapacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="p-6 border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Booking ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Movie</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_BOOKINGS.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-secondary/30 transition">
                      <td className="py-3 px-4 text-sm font-mono text-primary">{booking.id}</td>
                      <td className="py-3 px-4 text-sm">{booking.customer}</td>
                      <td className="py-3 px-4 text-sm">{booking.movie}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{booking.amount}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 BookMyShow. Admin Dashboard.</p>
        </div>
      </footer>
    </main>
  )
}
