"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CarFront } from "lucide-react";
import { useStore } from "@/lib/store";
import { CarEditor } from "@/components/admin/car-editor";
import { AdminPage, Empty } from "@/components/admin/ui";

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>();
  const car = useStore((s) => s.cars.find((c) => c.id === id));
  if (!car)
    return (
      <AdminPage eyebrow="Inventory" title="Car not" italic="found">
        <div className="chamfer border border-line bg-white/80">
          <Empty icon={<CarFront className="size-6" />} title="This car no longer exists" text="It may have been deleted." />
          <div className="pb-10 text-center">
            <Link href="/admin/inventory" className="link-u text-[14px] font-medium">Back to inventory</Link>
          </div>
        </div>
      </AdminPage>
    );
  return <CarEditor key={car.id} car={car} />;
}
