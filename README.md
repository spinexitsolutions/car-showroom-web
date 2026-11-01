# Orbis Motors — Luxury Car Showroom (Next.js)

A demo website for a premium car showroom, with an admin panel that includes a CRM and a CMS.
Built with **Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Lenis · Zustand**.

```bash
npm install
npm run dev        # http://localhost:3000
```

**Admin panel:** `/admin` (demo login: `admin@orbis.com` / `admin123`)

---

## Design language

- **Look:** Apple-style restraint. Cool paper `#f2f2ef`, deep graphite `#0a0a0c` and one electric-blue accent `#3b5bff`, which you can change from the admin panel. Button text switches between black and white automatically to stay readable on any accent.
- **Type:** one sans-serif family, *Archivo*, used at different widths. Headlines are heavy and slightly expanded, emphasis words are hairline-light and fully expanded, labels are wide uppercase, and body text is normal width. No serif fonts.
- **Layout:** mobile-first. Every page is built for a 390px screen first and has been checked for horizontal overflow.

## Public website

| Feature | Notes |
|---|---|
| **Intro animation** | Counter from 000 to 100 with a gauge line, the brand letters rise into view, then the screen splits open. You can turn it on or off, set the text and length, and choose whether it plays once per session (Admin → Content → Intro). |
| **"Orbit Island" navbar** | On desktop, a floating Dynamic-Island-style pill. When you scroll it shrinks to the logo, a scroll-progress ring and the current page; hovering expands it again. It hides on scroll down and comes back on scroll up. On mobile there is a bottom dock with a menu button that opens a full-screen menu with a circular reveal. |
| **Page transitions** | An ink curtain with the page name sweeps up between routes. |
| **Smooth scroll + custom cursor** | Lenis inertial scrolling. On desktop the cursor turns into a label bubble ("View", "Drag", "Book") over interactive items. Both can be switched off. |
| **Hero — "Showroom stage"** | Full-screen showcase that plays through the featured cars automatically. Each new car wipes in, and its name drops in letter by letter. A speedometer needle swings to the car's horsepower, and 0–100, top speed, torque and price count to the new values. A strip of thumbnails at the bottom lets you pick a car and shows progress to the next one. On desktop the image shifts slightly as you move the mouse. When you scroll, the hero stays in place, shrinks back, and the rest of the page slides over it like a sheet. |
| **Homepage** | 12 sections. You can show, hide and reorder them from the admin panel: the hero, brand marquee that reacts to scroll speed, pinned horizontal featured gallery, word-by-word manifesto reveal, expanding category panels, dark stats bento with counters, stacking "ownership journey" cards, EMI calculator, testimonials, journal, FAQ, closing CTA. |
| **Inventory** | Search, filters (body, fuel, condition, brand, status, price), sorting, animated grid, mobile filter sheet, filters kept in the URL. |
| **Car detail** | Gallery with lightbox and swipe, specs, colour picker, features, booking panel (test drive / enquiry / finance), similar cars. |
| **Tools** | Compare up to 3 cars, wishlist, EMI calculator, instant trade-in estimate. |
| **Pages** | Finance, Sell / Trade-in, Service booking, About, Contact (map), Journal (blog), Book a test drive. |
| **Lead capture** | Every form sends a lead into the CRM: test drive, enquiry, finance, trade-in, service, contact and newsletter. There is also a WhatsApp button. |

## Admin panel (`/admin`)

- **Dashboard:** pipeline value, new leads, upcoming test drives, stock, win rate, leads-per-day chart, lead-source donut, stage funnel, activity feed.
- **CRM:**
  - **Leads & pipeline:** Kanban board with drag-and-drop, or a table view. Filters, CSV export, and a lead drawer with call / email / WhatsApp buttons, stage, priority, owner, deal value and notes timeline.
  - **Test drives:** agenda view where you mark each drive as done or no-show.
  - **Customers:** buyers and prospects with lifetime value.
- **Inventory:** add, edit and delete cars, with image lists, colours, features, status, a "featured" flag and a live preview card.
- **CMS:**
  - **Website content:** hero, intro animation, homepage sections (toggle and reorder), manifesto, stats, brands, announcement bar.
  - **Other content:** journal posts, testimonials, FAQs.
- **Settings:** brand name, accent colour (updates live), contact details, socials, finance defaults, SEO, experience toggles, reset demo data.

## Architecture

```
src/
  app/(site)/        public website (layout = SiteShell, template = page transition)
  app/admin/         admin panel (login gate + shell)
  components/site/   navbar, intro, footer, cursor, car card, lead form, EMI…
  components/home/   homepage sections
  components/pages/  inner-page building blocks
  components/admin/  admin UI kit, charts, drawers, editors
  lib/store.ts       single Zustand store (persisted to localStorage)
  lib/seed.ts        demo inventory, leads, content, settings
```

All content and data live in one store, `src/lib/store.ts`, which is saved to `localStorage`. That way the demo runs with no backend, and every change in the admin panel shows up on the website right away **in the same browser**.

To run this in production, replace the store actions (`addLead`, `updateCar`, `updateSettings`, …) with calls to an API or database (Supabase, Prisma + Postgres, or Sanity for the CMS). Also replace the demo login with real authentication. The UI does not need to change.

Images are from Unsplash.
