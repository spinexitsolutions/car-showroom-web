"use client";

import { Navbar } from "./navbar";
import { Intro } from "./intro";
import { Footer } from "./footer";
import { AnnouncementBar, Cursor, SmoothScroll, WhatsAppButton } from "./experience";

/** Public website chrome. Everything here reads live settings from the admin CMS. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Intro />
      <SmoothScroll />
      <Cursor />
      <AnnouncementBar />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
