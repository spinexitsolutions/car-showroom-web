"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { CarCard } from "@/components/site/car-card";
import { Button } from "@/components/ui/button";
import { CompareTray } from "@/components/pages/compare-tray";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const wishlist = useStore((s) => s.wishlist);
  const all = useStore((s) => s.cars);
  const cars = useMemo(() => all.filter((c) => wishlist.includes(c.id)), [all, wishlist]);
  const total = cars.reduce((a, c) => a + c.price, 0);

  return (
    <>
      <PageHeader
        eyebrow={`Wishlist · ${hydrated ? wishlist.length : 0} saved`}
        title="Your"
        italic="garage of dreams."
        description={
          hydrated && cars.length
            ? `Together worth ${formatPrice(total)}. We can arrange back-to-back test drives for all of them.`
            : "Tap the heart on any car to keep it here. Your list stays on this device."
        }
      >
        {hydrated && cars.length > 1 && (
          <Button href="/book-test-drive" className="mt-6">
            Book a multi-car test drive
          </Button>
        )}
      </PageHeader>

      <section className="container-x pb-32">
        {!hydrated ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton aspect-[4/3] rounded-[1.75rem]" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-[2rem] bg-white py-24 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="grid size-16 place-items-center rounded-full bg-accent/12 text-accent"
            >
              <Heart className="size-7" />
            </motion.div>
            <p className="display mt-6 text-4xl">
              Nothing saved <span className="em-light">yet.</span>
            </p>
            <p className="mt-3 max-w-sm text-muted">Start exploring — the right car tends to find you.</p>
            <Button href="/inventory" className="mt-8">
              Explore collection
            </Button>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {cars.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
      <CompareTray />
    </>
  );
}
