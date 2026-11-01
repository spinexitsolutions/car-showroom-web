import type { Metadata, Viewport } from "next";
import { Saira, Chakra_Petch } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Saira (variable width) — motorsport-born sans for display + body.
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  axes: ["wdth"],
});
// Chakra Petch — angular, instrument-cluster sans for labels & read-outs.
const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Orbis Motors — Luxury & Performance Car Showroom",
    template: "%s · Orbis Motors",
  },
  description:
    "New and certified pre-owned luxury cars. Book a test drive, get instant trade-in valuation and finance offers.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${saira.variable} ${chakra.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
