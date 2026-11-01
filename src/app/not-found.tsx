import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6 text-center text-white">
      <div>
        <p className="eyebrow text-white/40">Error 404</p>
        <h1 className="display mt-6 text-[28vw] leading-none md:text-[16vw]">
          4<span className="em-light text-accent">0</span>4
        </h1>
        <p className="mt-4 text-white/60">Wrong turn. This road doesn&apos;t lead anywhere.</p>
        <Link href="/" className="mt-10 inline-flex h-12 items-center chamfer chamfer-sm bg-white px-6 text-[14px] font-medium text-ink">
          Back to showroom
        </Link>
      </div>
    </main>
  );
}
