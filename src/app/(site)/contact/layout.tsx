import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", description: "Visit, call or message our showroom." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
