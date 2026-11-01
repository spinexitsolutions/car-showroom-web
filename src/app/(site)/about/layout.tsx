import type { Metadata } from "next";

export const metadata: Metadata = { title: "About us", description: "Our story, values and the team behind the showroom." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
