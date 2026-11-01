import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your wishlist", description: "Cars you have saved." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
