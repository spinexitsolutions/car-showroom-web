export type BodyType = "SUV" | "Sedan" | "Coupe" | "Supercar" | "Convertible" | "Hatchback";
export type Fuel = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type Transmission = "Automatic" | "Manual";
export type Condition = "New" | "Certified Pre-Owned" | "Pre-Owned";
export type CarStatus = "available" | "reserved" | "sold";

export interface CarColor {
  name: string;
  hex: string;
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number; // INR
  bodyType: BodyType;
  fuel: Fuel;
  transmission: Transmission;
  condition: Condition;
  kmDriven: number;
  engine: string;
  power: string; // e.g. "650 hp"
  torque: string;
  topSpeed: string;
  acceleration: string; // 0-100
  range?: string; // EV range / fuel efficiency
  seats: number;
  colors: CarColor[];
  images: string[];
  tagline: string;
  description: string;
  features: string[];
  status: CarStatus;
  featured: boolean;
  badge?: string;
  views: number;
  createdAt: string;
}

export type LeadType =
  | "enquiry"
  | "test-drive"
  | "trade-in"
  | "service"
  | "finance"
  | "contact"
  | "newsletter";

export type LeadStage = "new" | "contacted" | "qualified" | "negotiation" | "won" | "lost";
export type LeadPriority = "low" | "medium" | "high";

export interface LeadNote {
  id: string;
  text: string;
  at: string;
  by: string;
}

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  carId?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  stage: LeadStage;
  priority: LeadPriority;
  source: string; // e.g. "Website · Car page"
  assignedTo?: string;
  value?: number;
  notes: LeadNote[];
  meta?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  car: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  content: string; // paragraphs separated by blank lines
  category: string;
  author: string;
  date: string;
  published: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export type SectionId =
  | "hero"
  | "brands"
  | "featured"
  | "categories"
  | "manifesto"
  | "stats"
  | "process"
  | "finance"
  | "testimonials"
  | "journal"
  | "faq"
  | "cta";

export interface HomeSection {
  id: SectionId;
  label: string;
  enabled: boolean;
}

export interface SiteSettings {
  brandName: string;
  brandShort: string; // used in logo mark
  tagline: string;
  accent: string; // hex
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  hours: string;
  socials: { instagram: string; youtube: string; x: string; facebook: string };
  announcement: { enabled: boolean; text: string; link: string };
  intro: {
    enabled: boolean;
    oncePerSession: boolean;
    title: string;
    subtitle: string;
    durationMs: number;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string; // rendered in serif italic
    subtitle: string;
    image: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  manifesto: string;
  stats: { label: string; value: number; suffix: string }[];
  brands: string[];
  sections: HomeSection[];
  finance: { interestRate: number; maxTenureYears: number; minDownPct: number };
  seo: { title: string; description: string };
  pageTransitions: boolean;
  customCursor: boolean;
  smoothScroll: boolean;
}

export interface Activity {
  id: string;
  text: string;
  at: string;
  kind: "lead" | "car" | "cms" | "system";
}
