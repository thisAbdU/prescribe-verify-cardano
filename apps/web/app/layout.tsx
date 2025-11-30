import type React from "react"
import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "PrescribeVerify - Secure Prescription Verification",
  description:
    "A blockchain-powered prescription verification system ensuring safety and trust.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} antialiased`}>
      <body className="bg-background font-sans text-foreground">{children}</body>
    </html>
  )
}
