import { Suspense } from "react";
import { InventoryView } from "@/components/pages/inventory-view";

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <InventoryView />
    </Suspense>
  );
}
