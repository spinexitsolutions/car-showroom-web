"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { useStore, useHydrated } from "@/lib/store";
import { Reveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { formatDate } from "@/lib/utils";
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
          Story not <span className="em-light">found.</span>
        </h1>
        <Button href="/journal" className="mt-8">
          Back to journal
        </Button>
      </div>
    );

  return <Article post={post} related={related} />;
}

function Article({ post, related }: { post: Post; related: Post[] }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean);
  const minutes = Math.max(1, Math.round(post.content.split(/\s+/).length / 200));

  return (
    <article>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-accent" />

      <PageHeader
        eyebrow={`${post.category} · ${minutes} min read`}
        title={post.title}
        image={post.cover}
        description={`By ${post.author} · ${formatDate(post.date)}`}
      />

      <div className="container-x mt-16 md:mt-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-2xl font-medium leading-snug tracking-tight md:text-[28px]">{post.excerpt}</p>
          <div className="mt-10 space-y-6">
            {paragraphs.map((p, i) => (
              <Reveal key={i} y={16}>
                <p className={`text-[18px] leading-[1.75] text-ink/80 ${i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-bold first-letter:[font-stretch:125%] first-letter:text-[72px] first-letter:leading-[0.8] first-letter:text-accent" : ""}`}>
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 rounded-[1.75rem] bg-ink p-8 text-white">
            <p className="display text-3xl">
              Inspired? <span className="em-light text-accent">Take one for a spin.</span>
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
