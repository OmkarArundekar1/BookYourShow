"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Check } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const seats = searchParams.get("seats")?.split(",") || []
  const showId = searchParams.get("show") || "1"

  const [step, setStep] = useState<"payment" | "confirmation">("payment")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet">("card")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  })

  const [bookingRef, setBookingRef] = useState("")

  const totalPrice = seats.length * 12.99
  const taxes = totalPrice * 0.08
  const finalPrice = totalPrice + taxes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // Create booking
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          show_id: showId,
          seats: seats,
        }),
      })

      const bookingData = await bookingResponse.json()
      if (!bookingResponse.ok) throw new Error(bookingData.error)

      // Process payment
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingData.booking_id,
          amount: finalPrice,
          payment_mode: paymentMethod,
          payment_status: "success",
        }),
      })

      const paymentData = await paymentResponse.json()
      if (!paymentResponse.ok) throw new Error(paymentData.error)

      const ref = `BYS${bookingData.booking_id}`
      setBookingRef(ref)
      setStep("confirmation")
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === "confirmation") {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-12 border-border text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-4">
                <Check className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">Your movie tickets have been successfully booked</p>

            <div className="bg-secondary/50 rounded-lg p-8 mb-8 text-left space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Reference</span>
                <span className="font-bold text-lg text-primary">{bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-semibold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span className="font-semibold">{seats.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-lg">${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              A confirmation email has been sent to {formData.email}. Please arrive 15 minutes before the show starts.
            </p>

            <div className="flex gap-4 flex-col sm:flex-row">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 h-12">Back to Home</Button>
              </Link>
              <Link href="/bookings" className="flex-1">
                <Button variant="outline" className="w-full border-border h-12 bg-transparent">
                  View My Bookings
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href={`/seats/${showId}`} className="flex items-center gap-2 text-primary mb-8 hover:text-primary/80">
          <ArrowLeft className="w-5 h-5" />
          Back to Seat Selection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border">
              <h1 className="text-2xl font-bold mb-8">Complete Your Booking</h1>

              <form onSubmit={handlePayment} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mb-4"
                  />
                  <Input
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                  <div className="space-y-3 mb-6">
                    {[
                      { id: "card", label: "Credit/Debit Card" },
                      { id: "upi", label: "UPI" },
                      { id: "wallet", label: "Digital Wallet" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-secondary/50 transition"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value as "card" | "upi" | "wallet")}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                      <Input
                        placeholder="Card Number"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        maxLength={16}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="MM/YY"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          required
                          maxLength={5}
                        />
                        <Input
                          placeholder="CVV"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          maxLength={4}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <Input
                        placeholder="UPI ID"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="w-4 h-4 mt-1" />
                  <span className="text-sm text-muted-foreground">
                    I agree to the terms and conditions and cancellation policy
                  </span>
                </label>

                <Button type="submit" disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 h-12">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border-border sticky top-32 space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 pb-4 border-b border-border">
                  <div>
                    <p className="text-muted-foreground text-sm">Movie</p>
                    <p className="font-semibold">The Quantum Paradox</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Theater</p>
                    <p className="font-semibold">Cineplex Central</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Date & Time</p>
                    <p className="font-semibold">Jan 20, 2025 • 01:30 PM</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Seats</h3>
                <div className="flex flex-wrap gap-2">
                  {seats.map((seat) => (
                    <span key={seat} className="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-semibold">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{seats.length} Tickets @ $12.99</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="font-semibold">${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-border">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-primary">${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-4 text-xs text-muted-foreground">
                <p className="mb-2">Secure Payment Gateway</p>
                <div className="flex justify-center gap-2">
                  <span className="text-xs">🔒</span>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 BookYourShow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutContent />
    </Suspense>
  )
}
