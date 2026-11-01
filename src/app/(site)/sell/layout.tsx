import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sell or trade-in your car", description: "Get an instant valuation for your car." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
