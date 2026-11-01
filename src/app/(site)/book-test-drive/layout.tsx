import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book a test drive", description: "Book a test drive at the showroom or at home." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
