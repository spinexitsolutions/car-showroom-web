"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { Reveal, SplitText } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { EASE, formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const hydrated = useHydrated();
  const posts = useStore((s) => s.posts);
  const post = posts.find((p) => p.slug === slug && p.published);
  const related = useMemo(() => posts.filter((p) => p.published && p.slug !== slug).slice(0, 2), [posts, slug]);

  if (!hydrated) return <div className="container-x pt-40"><div className="skeleton h-[60vh] rounded-[2rem]" /></div>;

  if (!post)
    return (
      <div className="container-x flex min-h-[80dvh] flex-col items-center justify-center text-center">
        <h1 className="display text-6xl">
          Story not <span className="serif-i">found.</span>
        </h1>
        <Button href="/journal" className="mt-8">
          Back to journal
        </Button>
      </div>
    );

  return <Article post={post} related={related} />;
}

function Article({ post, related }: { post: Post; related: Post[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(heroP, [0, 1], ["0%", "25%"]);
  const imgScale = useTransform(heroP, [0, 1], [1.05, 1.2]);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean);
  const minutes = Math.max(1, Math.round(post.content.split(/\s+/).length / 200));

  return (
    <article>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-accent" />

      <header className="container-x pt-32 md:pt-44">
        <Link href="/journal" className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" /> Journal
        </Link>
        <p className="eyebrow mt-8 text-accent">
          {post.category} · {minutes} min read
        </p>
        <h1 className="display mt-4 max-w-5xl text-[44px] sm:text-6xl lg:text-[96px]">
          <SplitText text={post.title} trigger="mount" stagger={0.04} />
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-[14px] text-muted">
          By <b className="font-medium text-ink">{post.author}</b> · {formatDate(post.date)}
        </motion.p>
      </header>

      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 40, clipPath: "inset(8% 4% 0% 4% round 2rem)" }}
        animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
        className="container-x mt-12"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] md:aspect-[21/9]">
          <motion.img src={post.cover} alt={post.title} style={{ y: imgY, scale: imgScale }} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </motion.div>

      <div className="container-x mt-16 md:mt-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-2xl font-medium leading-snug tracking-tight md:text-[28px]">{post.excerpt}</p>
          <div className="mt-10 space-y-6">
            {paragraphs.map((p, i) => (
              <Reveal key={i} y={16}>
                <p className={`text-[18px] leading-[1.75] text-ink/80 ${i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-[72px] first-letter:leading-[0.8] first-letter:text-accent" : ""}`}>
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 rounded-[1.75rem] bg-ink p-8 text-white">
            <p className="display text-3xl">
              Inspired? <span className="serif-i text-accent">Take one for a spin.</span>
            </p>
            <Button href="/book-test-drive" variant="light" className="mt-6">
              Book a test drive
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-x mt-28 pb-32">
          <p className="eyebrow text-muted">Keep reading</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {related.map((p) => (
              <Link key={p.id} href={`/journal/${p.slug}`} data-cursor="Read" className="group flex items-center gap-5 rounded-[1.75rem] bg-white p-3 pr-6">
                <div className="aspect-square w-28 shrink-0 overflow-hidden rounded-2xl md:w-36">
                  <img src={p.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div>
                  <p className="eyebrow text-muted">{p.category}</p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
