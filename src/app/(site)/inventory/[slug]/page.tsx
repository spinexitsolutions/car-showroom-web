"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, useHydrated } from "@/lib/store";
import { CarDetail } from "@/components/pages/car-detail";

export default function CarPage() {
  const { slug } = useParams<{ slug: string }>();
  const hydrated = useHydrated();
  const car = useStore((s) => s.cars.find((c) => c.slug === slug));

  if (!hydrated)
    return (
      <div className="container-x pb-24 pt-32 md:pt-40">
        <div className="skeleton h-4 w-40 rounded-full" />
        <div className="skeleton mt-6 h-20 w-3/4 rounded-3xl" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="skeleton aspect-[16/10] rounded-[2rem]" />
          <div className="skeleton h-[480px] rounded-[2rem]" />
        </div>
      </div>
    );

  if (!car)
    return (
      <div className="container-x flex min-h-[80dvh] flex-col items-center justify-center pt-24 text-center">
        <p className="eyebrow text-muted">Error 404</p>
        <h1 className="display mt-4 text-6xl md:text-8xl">
          Car not <span className="serif-i">found.</span>
        </h1>
        <p className="mt-4 max-w-md text-muted">It may have been sold or moved. Explore the rest of the collection.</p>
        <Link href="/inventory" className="mt-8 rounded-full bg-ink px-6 py-3.5 text-[14px] font-medium text-white">
          Browse collection
        </Link>
      </div>
    );

  return <CarDetail key={car.id} car={car} />;
}
