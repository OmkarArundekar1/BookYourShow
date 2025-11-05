"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface Offer {
  id: number
  title: string
  description: string
  discount: string
  code: string
  validity: string
  category: "coupon" | "cashback" | "special"
  expiry: string
}

const offers: Offer[] = [
  {
    id: 1,
    title: "Flat 30% Off on All Movies",
    description: "Get 30% discount on ticket bookings across all theatres and movies",
    discount: "30%",
    code: "MOVIE30",
    validity: "Valid till Nov 30",
    category: "coupon",
    expiry: "5 days left",
  },
  {
    id: 2,
    title: "Cashback on Weekend Shows",
    description: "Get up to 20% cashback when you book tickets for weekend shows",
    discount: "20%",
    code: "WEEKEND20",
    validity: "Valid till Dec 15",
    category: "cashback",
    expiry: "20 days left",
  },
  {
    id: 3,
    title: "ICICI Bank Special Offer",
    description: "Extra 15% off with ICICI credit and debit cards",
    discount: "15%",
    code: "ICICI15",
    validity: "Valid till Dec 31",
    category: "special",
    expiry: "34 days left",
  },
  {
    id: 4,
    title: "Students Get 25% Off",
    description: "Verified students can get 25% discount on all movie tickets",
    discount: "25%",
    code: "STUDENT25",
    validity: "Valid year-round",
    category: "coupon",
    expiry: "180 days left",
  },
  {
    id: 5,
    title: "Tuesday Movie Bonanza",
    description: "Premium movies at regular prices every Tuesday",
    discount: "40%",
    code: "TUESDY40",
    validity: "Every Tuesday",
    category: "special",
    expiry: "Ongoing",
  },
  {
    id: 6,
    title: "First Purchase Offer",
    description: "Get 50% off on your first booking. Maximum discount of 500",
    discount: "50%",
    code: "FIRST50",
    validity: "Valid once per user",
    category: "coupon",
    expiry: "90 days left",
  },
]

export default function OffersPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "coupon" | "cashback" | "special">("all")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const filteredOffers = activeFilter === "all" ? offers : offers.filter((o) => o.category === activeFilter)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "coupon":
        return "bg-blue-900 text-blue-100"
      case "cashback":
        return "bg-green-900 text-green-100"
      case "special":
        return "bg-purple-900 text-purple-100"
      default:
        return "bg-secondary text-foreground"
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/20 to-background py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-balance">Exclusive Offers & Deals</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Grab amazing discounts and exclusive offers on movie tickets
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => setActiveFilter("all")}
            variant={activeFilter === "all" ? "default" : "outline"}
            className={activeFilter === "all" ? "bg-primary" : "border-border hover:bg-secondary"}
          >
            All Offers
          </Button>
          <Button
            onClick={() => setActiveFilter("coupon")}
            variant={activeFilter === "coupon" ? "default" : "outline"}
            className={activeFilter === "coupon" ? "bg-primary" : "border-border hover:bg-secondary"}
          >
            Coupons
          </Button>
          <Button
            onClick={() => setActiveFilter("cashback")}
            variant={activeFilter === "cashback" ? "default" : "outline"}
            className={activeFilter === "cashback" ? "bg-primary" : "border-border hover:bg-secondary"}
          >
            Cashback
          </Button>
          <Button
            onClick={() => setActiveFilter("special")}
            variant={activeFilter === "special" ? "default" : "outline"}
            className={activeFilter === "special" ? "bg-primary" : "border-border hover:bg-secondary"}
          >
            Special Offers
          </Button>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="p-6 bg-card border-border flex flex-col hover:border-primary/50 transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{offer.title}</h3>
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                </div>
                <Badge className={`ml-2 flex-shrink-0 ${getCategoryColor(offer.category)} border-0`}>
                  {offer.category.charAt(0).toUpperCase()}
                </Badge>
              </div>

              {/* Discount Display */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                <div className="text-3xl font-bold text-primary mb-1">{offer.discount} OFF</div>
                <div className="text-sm text-muted-foreground">{offer.validity}</div>
              </div>

              {/* Code Section */}
              <div className="bg-input rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="font-mono font-semibold text-foreground">{offer.code}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(offer.code)}
                  className="hover:bg-secondary"
                >
                  {copiedCode === offer.code ? "Copied!" : "Copy"}
                </Button>
              </div>

              {/* Expiry & CTA */}
              <div className="text-sm text-muted-foreground mb-4">
                <span>{offer.expiry}</span>
              </div>

              <Link href="/" className="mt-auto">
                <Button className="w-full bg-primary hover:bg-primary/90">Book Now</Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Terms & Conditions */}
        <div className="mt-16 bg-secondary/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>- Offers are valid only on BookMyShow platform</li>
            <li>- Each coupon can be used only once per user</li>
            <li>- Maximum discount per transaction is as mentioned in the offer</li>
            <li>- Offers cannot be combined or stacked</li>
            <li>- BookMyShow reserves the right to modify or cancel offers anytime</li>
            <li>- Terms & conditions apply, visit help center for more details</li>
          </ul>
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
