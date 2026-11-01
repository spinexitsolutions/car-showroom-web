"use client";

import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { LeadForm } from "@/components/site/lead-form";
import { Reveal } from "@/components/ui/motion";

export default function ContactPage() {
  const s = useStore((st) => st.settings);
  const cards = [
    { icon: Phone, label: "Call us", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with an advisor", href: `https://wa.me/${s.whatsapp}` },
    { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    { icon: MapPin, label: "Visit", value: s.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery)}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's"
        italic="talk cars."
        description="Questions, a quote, or just an espresso and a look around — we're here seven days a week."
      />

      <section className="container-x">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex h-full flex-col justify-between gap-10 rounded-[1.75rem] bg-white p-6 transition-colors duration-500 hover:bg-ink hover:text-white"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-full bg-accent/12 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <c.icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" />
                </div>
                <div>
                  <p className="eyebrow text-muted group-hover:text-white/50">{c.label}</p>
                  <p className="mt-1 text-[17px] font-semibold leading-snug tracking-tight">{c.value}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x mt-6 pb-32">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="relative h-[380px] overflow-hidden rounded-[2rem] bg-paper-2 lg:h-full lg:min-h-[620px]">
              <iframe
                title="Showroom location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
                className="absolute inset-0 h-full w-full grayscale contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="glass absolute bottom-4 left-4 right-4 flex items-center gap-4 rounded-2xl p-4 md:right-auto">
                <Clock className="size-5 shrink-0 text-accent" />
                <div>
                  <p className="eyebrow text-muted">Open</p>
                  <p className="text-[15px] font-semibold">{s.hours}</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-white p-6 md:p-10">
              <p className="eyebrow text-muted">Send a message</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">
                We reply in <span className="serif-i">minutes.</span>
              </h2>
              <LeadForm
                className="mt-8"
                type="contact"
                source="Website · Contact"
                submitLabel="Send message"
                extra={[
                  { name: "topic", label: "Topic", type: "select", options: ["Buying a car", "Selling / trade-in", "Finance", "Service", "Corporate / fleet", "Something else"] },
                ]}
                successTitle="Message sent"
                successText="Thanks for reaching out — an advisor will get back to you shortly."
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
