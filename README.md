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
- **Type:** two sans-serif fonts that templates rarely use. *Saira* (motorsport-born, variable width) for headlines and body text: heavy and slightly expanded for headlines, ultra-light and fully expanded for emphasis words. *Chakra Petch* (angular, like a car dashboard) for labels and numbers. No serif fonts.
- **Shape:** chamfered (cut) corners and HUD corner brackets instead of rounded pills.
- **Layout:** mobile-first. Every page is built for a 390px screen first and has been checked for horizontal overflow.

## Public website

| Feature | Notes |
|---|---|
| **Intro animation** | Counter from 000 to 100 with a gauge line, the brand letters rise into view, then the screen splits open. You can turn it on or off, set the text and length, and choose whether it plays once per session (Admin → Content → Intro). |
| **"Corner HUD" navbar** | Slanted racing-style logo top-left, with the live showroom clock, open/closed status and how many cars are in stock. Links are numbered like gauge ticks, with an accent underline that slides between them. At the top of the page the bar is transparent over the dark header; once you scroll it turns into a solid strip with a full-width accent bar showing scroll progress. The menu opens with a five-blade "shutter". On mobile, once you scroll, a bottom bar appears with Call, WhatsApp and Book a test drive. |
| **Page transitions** | An ink curtain with the page name sweeps up between routes. |
| **Smooth scroll + custom cursor** | Lenis inertial scrolling. On desktop the cursor turns into a label bubble ("View", "Drag", "Book") over interactive items. Both can be switched off. |
| **Hero — "Showroom stage"** | Full-screen showcase that plays through the featured cars automatically. Each new car wipes in, and its name drops in letter by letter. A speedometer needle swings to the car's horsepower, and 0–100, top speed, torque and price count to the new values. A strip of thumbnails at the bottom lets you pick a car and shows progress to the next one. On desktop the image shifts slightly as you move the mouse. When you scroll, the hero stays in place, shrinks back, and the rest of the page slides over it like a sheet. |
| **Homepage** | 12 sections. You can show, hide and reorder them from the admin panel: the hero, brand marquee that reacts to scroll speed, pinned horizontal featured gallery, word-by-word manifesto reveal, expanding category panels, dark stats bento with counters, stacking "ownership journey" cards, EMI calculator, testimonials, journal, FAQ, closing CTA. |
| **Inner pages** | Every inner page opens on a dark header in the same style as the homepage hero: background photo picked for that page, breadcrumb, large headline. The page content then continues on a light sheet. The car detail page has its own full-screen header with a photo switcher, the horsepower speedometer and a live spec bar. |
| **Inventory** | Search, filters (body, fuel, condition, brand, status, price), sorting, animated grid, mobile filter sheet, filters kept in the URL. |
| **Car detail** | Gallery with lightbox and swipe, specs, colour picker, features, booking panel (test drive / enquiry / finance), similar cars. |
| **Tools** | Compare up to 3 cars, wishlist, EMI calculator, instant trade-in estimate. |
| **Pages** | Finance, Sell / Trade-in, Service booking, About, Contact (map), Journal (blog), Book a test drive. |
| **Lead capture** | Every form sends a lead into the CRM: test drive, enquiry, finance, trade-in, service, contact and newsletter. There is also a WhatsApp button. |

## Admin panel (`/admin`)

The admin panel uses the same instrument-cluster style as the website: dark sidebar with numbered navigation, a live clock and a pipeline status box; a dark header band on every admin page; chamfered panels; and *Chakra Petch* numbers.


- **Dashboard:** "Showroom telemetry" with three speedometer-style gauges (win rate, leads in the last 7 days, share of stock available), plus pipeline value, new leads, upcoming test drives, stock, win rate, leads-per-day chart, lead-source donut, stage funnel, activity feed.
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
