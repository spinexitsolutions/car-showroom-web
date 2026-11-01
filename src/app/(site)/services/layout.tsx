import type { Metadata } from "next";

export const metadata: Metadata = { title: "Service & care", description: "Book periodic service, detailing, ceramic coating and more." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
