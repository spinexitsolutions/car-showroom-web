import type { Metadata } from "next";

export const metadata: Metadata = { title: "The Collection", description: "Browse new and certified pre-owned luxury and performance cars." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
