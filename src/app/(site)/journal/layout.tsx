import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journal", description: "Stories, guides and news from the showroom floor." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
