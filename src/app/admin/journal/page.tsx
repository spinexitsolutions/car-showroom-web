"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import type { Post } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatDate, slugify, uid } from "@/lib/utils";
import { AdminPage, Btn, Chip, Drawer, Empty, Field, TextArea, Toggle } from "@/components/admin/ui";
import { useToast } from "@/components/admin/toast";

export default function JournalAdmin() {
  const posts = useStore((s) => s.posts);
  const upsertPost = useStore((s) => s.upsertPost);
  const deletePost = useStore((s) => s.deletePost);
  const user = useStore((s) => s.adminUser);
  const toast = useToast();
  const [edit, setEdit] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);

  function create() {
    setIsNew(true);
    setEdit({
      id: uid(),
      slug: "",
      title: "",
      excerpt: "",
      cover: "",
      content: "",
      category: "Stories",
      author: user?.name ?? "Orbis Editorial",
      date: new Date().toISOString(),
      published: false,
    });
  }

  const set = <K extends keyof Post>(k: K, v: Post[K]) =>
    setEdit((p) => {
      if (!p) return p;
      const n = { ...p, [k]: v };
      if (k === "title" && isNew) n.slug = slugify(String(v));
      return n;
    });

  return (
    <AdminPage
      eyebrow="CMS"
      title="Journal"
      italic={`· ${posts.length} posts`}
      actions={
        <Btn variant="ink" onClick={create}>
          <Plus className="size-4" /> New post
        </Btn>
      }
    >
      {posts.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white/80">
          <Empty icon={<Newspaper className="size-6" />} title="No posts yet" text="Write your first story for the Journal." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {[...posts]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="group overflow-hidden rounded-3xl border border-line bg-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper-2">
                    {p.cover && <img src={p.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    <Chip className={cn("absolute left-3 top-3 backdrop-blur", p.published ? "bg-emerald-500/90 text-white" : "bg-white/90 text-ink")}>
                      {p.published ? "Published" : "Draft"}
                    </Chip>
                  </div>
                  <div className="p-5">
                    <p className="eyebrow !text-[10px] text-muted">{p.category} · {formatDate(p.date)}</p>
                    <h3 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-snug tracking-tight">{p.title || "Untitled"}</h3>
                    <p className="mt-2 line-clamp-2 text-[13px] text-muted">{p.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Btn onClick={() => { setIsNew(false); setEdit(p); }}><Pencil className="size-4" /> Edit</Btn>
                      {p.published && (
                        <a href={`/journal/${p.slug}`} target="_blank" className="grid size-10 place-items-center rounded-full border border-line hover:bg-paper" aria-label="View">
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Delete “${p.title}”?`)) {
                            deletePost(p.id);
                            toast("Post deleted");
                          }
                        }}
                        className="ml-auto grid size-10 place-items-center rounded-full text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
          </AnimatePresence>
        </div>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        wide
        title={isNew ? "New post" : "Edit post"}
        footer={
          <div className="flex items-center justify-between gap-3">
            {edit && <Toggle checked={edit.published} onChange={(v) => set("published", v)} label="Published" />}
            <Btn
              variant="ink"
              onClick={() => {
                if (!edit?.title.trim()) return toast("Title is required", "error");
                upsertPost({ ...edit, slug: edit.slug || slugify(edit.title) });
                toast(edit.published ? "Post published" : "Draft saved");
                setEdit(null);
              }}
            >
              Save post
            </Btn>
          </div>
        }
      >
        {edit && (
          <div className="space-y-3.5">
            {edit.cover && <img src={edit.cover} alt="" className="aspect-[16/8] w-full rounded-2xl object-cover" />}
            <Field label="Title" value={edit.title} onChange={(e) => set("title", e.target.value)} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Slug" value={edit.slug} onChange={(e) => set("slug", slugify(e.target.value))} hint={`/journal/${edit.slug || "…"}`} />
              <Field label="Category" value={edit.category} onChange={(e) => set("category", e.target.value)} />
              <Field label="Author" value={edit.author} onChange={(e) => set("author", e.target.value)} />
              <Field label="Date" type="date" value={edit.date.slice(0, 10)} onChange={(e) => set("date", new Date(e.target.value).toISOString())} />
            </div>
            <Field label="Cover image URL" value={edit.cover} onChange={(e) => set("cover", e.target.value)} />
            <TextArea label="Excerpt" rows={2} value={edit.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            <TextArea label="Content (blank line = new paragraph)" rows={12} value={edit.content} onChange={(e) => set("content", e.target.value)} />
          </div>
        )}
      </Drawer>
    </AdminPage>
  );
}
