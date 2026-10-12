import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font: no runtime request to Google.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Ebenezer & Audrey · 19 January 2027",
  description: "Join us at Sunset Garden, Kitwe. Kindly RSVP.",
};

export const viewport: Viewport = {
  themeColor: "#fffaf9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
