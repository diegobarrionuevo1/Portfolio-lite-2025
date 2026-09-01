"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/ds";
import { formatDate, mono, postHref } from "@/components/blog/shared";

/**
 * Client-side filtering for the blog index.
 *
 * The previous filters were links back into a dynamically-rendered page: every
 * click was a server round-trip that re-rendered the whole route and replayed
 * its entry animations — it felt like a page reload because it effectively was
 * one. The index holds at most a couple dozen posts, so the full list ships
 * with the page and filtering is a state change: instant, no navigation.
 *
 * The URL still reflects the active filter (same `tag` / `orden` params the
 * server version used, so old shared links keep meaning the same thing), but
 * through replaceState — never a navigation.
 */

export interface ExplorerTag {
  slug: string;
  name: string;
}

export interface ExplorerPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  readingTime: number;
  tags: ExplorerTag[];
}

type Order = "newest" | "oldest";

function readUrlState(): { tag: string | null; order: Order } {
  const params = new URLSearchParams(window.location.search);
  return {
    tag: params.get("tag"),
    order: params.get("orden") === "antiguos" ? "oldest" : "newest",
  };
}

function writeUrlState(tag: string | null, order: Order): void {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (order === "oldest") params.set("orden", "antiguos");
  const query = params.toString();
  window.history.replaceState(null, "", query ? `/blog?${query}` : "/blog");
}

export function PostExplorer({ posts }: { posts: ExplorerPost[] }) {
  // Starts unfiltered to match the server-rendered HTML; the URL's filter is
  // applied after hydration. Initialising from location during render would
  // desync the first client render from the server markup.
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>("newest");

  useEffect(() => {
    const initial = readUrlState();
    if (initial.tag !== null) setActiveTag(initial.tag);
    if (initial.order !== "newest") setOrder(initial.order);
  }, []);

  const apply = (tag: string | null, nextOrder: Order): void => {
    setActiveTag(tag);
    setOrder(nextOrder);
    writeUrlState(tag, nextOrder);
  };

  // Counts come from the posts on screen, so a chip never advertises a
  // vertical its filter cannot show.
  const tags = useMemo(() => {
    const seen = new Map<string, { tag: ExplorerTag; count: number }>();
    for (const post of posts) {
      for (const tag of post.tags) {
        const entry = seen.get(tag.slug);
        if (entry) entry.count += 1;
        else seen.set(tag.slug, { tag, count: 1 });
      }
    }
    return Array.from(seen.values()).sort((a, b) => b.count - a.count);
  }, [posts]);

  const visible = useMemo(() => {
    const filtered = activeTag
      ? posts.filter((post) => post.tags.some((tag) => tag.slug === activeTag))
      : posts;
    return [...filtered].sort((a, b) => {
      const delta = Date.parse(a.publishedAt ?? "") - Date.parse(b.publishedAt ?? "");
      return order === "oldest" ? delta : -delta;
    });
  }, [posts, activeTag, order]);

  return (
    <>
      {tags.length > 0 ? (
        <div className="blog-filters">
          <div className="blog-filters__group">
            <span className="blog-filters__label">Tema</span>
            <button
              type="button"
              className="filter-chip"
              data-active={activeTag ? undefined : "true"}
              onClick={() => apply(null, order)}
            >
              Todos
            </button>
            {tags.map(({ tag, count }) => (
              <button
                key={tag.slug}
                type="button"
                className="filter-chip"
                data-active={activeTag === tag.slug ? "true" : undefined}
                onClick={() => apply(activeTag === tag.slug ? null : tag.slug, order)}
              >
                {tag.name}
                <span className="filter-chip__count">{count}</span>
              </button>
            ))}
          </div>

          <div className="blog-filters__group">
            <span className="blog-filters__label">Orden</span>
            <button
              type="button"
              className="filter-chip"
              data-active={order === "newest" ? "true" : undefined}
              onClick={() => apply(activeTag, "newest")}
            >
              Recientes
            </button>
            <button
              type="button"
              className="filter-chip"
              data-active={order === "oldest" ? "true" : undefined}
              onClick={() => apply(activeTag, "oldest")}
            >
              Antiguos
            </button>
          </div>
        </div>
      ) : null}

      <p style={{ ...mono, margin: "var(--space-4) 0 0", color: "var(--text-muted)" }}>
        {visible.length} {visible.length === 1 ? "nota" : "notas"}
        {activeTag ? ` · ${tags.find((t) => t.tag.slug === activeTag)?.tag.name ?? activeTag}` : ""}
      </p>

      {visible.length === 0 ? (
        <p style={{ ...mono, color: "var(--text-muted)" }}>
          {activeTag ? "No hay notas con ese tema todavía." : "Todavía no hay notas publicadas."}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,360px),1fr))",
            gap: "var(--space-5)",
          }}
        >
          {visible.map((post) => (
            <article
              key={post.id}
              className="post-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
                padding: "var(--space-6)",
                borderRadius: "var(--r-card)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-card)",
              }}
            >
              <div
                style={{
                  ...mono,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--space-3)",
                  color: "var(--text-muted)",
                }}
              >
                <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime} min</span>
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-title-2)",
                  fontWeight: 500,
                  letterSpacing: "var(--ls-title)",
                  lineHeight: "var(--lh-snug)",
                  textWrap: "balance",
                }}
              >
                <Link href={postHref(post.slug)} style={{ color: "var(--text-primary)" }}>
                  {post.title}
                </Link>
              </h2>

              {post.excerpt ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--fs-body-sm)",
                    lineHeight: "var(--lh-body)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {post.excerpt}
                </p>
              ) : null}

              {post.tags.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-2)",
                    marginTop: "auto",
                    paddingTop: "var(--space-2)",
                  }}
                >
                  {post.tags.slice(0, 4).map((tag) => (
                    <Tag key={tag.slug}>{tag.name}</Tag>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
