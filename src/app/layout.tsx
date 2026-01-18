import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Search Engine - Find Your Perfect Flight",
  description: "Search, compare, and book flights with real-time pricing, advanced filtering, and beautiful UI. Built with Next.js and Amadeus API.",
  keywords: ["flights", "travel", "booking", "flight search", "cheap flights", "flight deals"],
  authors: [{ name: "Kalkidan" }],
  openGraph: {
    title: "Flight Search Engine - Find Your Perfect Flight",
    description: "Search and compare flights with real-time pricing and advanced filtering",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
