import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <title>Dozyly</title>
        <meta name="description" content="Track and improve your sleep habits with Dozyly" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning className={inter.className}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}
