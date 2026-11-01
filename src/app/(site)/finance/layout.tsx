import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finance & EMI", description: "Calculate your EMI and apply for car finance in minutes." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
