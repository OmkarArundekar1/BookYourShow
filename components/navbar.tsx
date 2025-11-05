"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          BookMyShow
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/movies" className="text-foreground hover:text-primary transition">
            Movies
          </Link>
          <Link href="/theaters" className="text-foreground hover:text-primary transition">
            Theaters
          </Link>
          <Link href="/offers" className="text-foreground hover:text-primary transition">
            Offers
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
              <Link href="/bookings">
                <Button variant="outline" className="border-border hover:bg-secondary bg-transparent">
                  My Bookings
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:text-primary">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" className="border-border hover:bg-secondary bg-transparent">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            ☰
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary/50 border-t border-border p-4">
          <Link href="/movies" className="block py-2 text-foreground hover:text-primary">
            Movies
          </Link>
          <Link href="/theaters" className="block py-2 text-foreground hover:text-primary">
            Theaters
          </Link>
          <Link href="/offers" className="block py-2 text-foreground hover:text-primary">
            Offers
          </Link>
        </div>
      )}
    </nav>
  )
}
