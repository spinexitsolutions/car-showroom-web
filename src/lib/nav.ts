import { u } from "./seed";

/** Primary navigation. `image` is shown in the full-screen menu on hover. */
export const NAV = [
  { href: "/", label: "Home", image: u("1485291571150-772bcfc10da5", 1200) },
  { href: "/inventory", label: "Collection", image: u("1612825173281-9a193378527e", 1200) },
  { href: "/finance", label: "Finance", image: u("1620891549027-942fdc95d3f5", 1200) },
  { href: "/sell", label: "Sell / Trade-in", image: u("1617531653332-bd46c24f2068", 1200) },
  { href: "/services", label: "Service", image: u("1486006920555-c77dcf18193c", 1200) },
  { href: "/journal", label: "Journal", image: u("1571607388263-1044f9ea01dd", 1200) },
  { href: "/about", label: "About", image: u("1583121274602-3e2820c69888", 1200) },
  { href: "/contact", label: "Contact", image: u("1599912027611-484b9fc447af", 1200) },
] as const;

/** Links shown inline in the desktop island (subset). */
export const NAV_INLINE = ["/inventory", "/finance", "/sell", "/services", "/about"];
