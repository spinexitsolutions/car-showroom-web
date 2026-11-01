import { Suspense } from "react";
import { BookTestDrive } from "@/components/pages/book-test-drive";

export default function BookTestDrivePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <BookTestDrive />
    </Suspense>
  );
}
