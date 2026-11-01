import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compare cars", description: "Compare up to three cars side by side." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
