import type { Metadata } from "next";
import { BlogIndexView } from "@/components/blog/index-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on software, AI and the tools I use every day. First-hand analysis, no hype.",
  alternates: {
    canonical: "/en/blog",
    languages: { es: "/blog", en: "/en/blog" },
  },
  openGraph: {
    title: "Blog | Diego Barrionuevo",
    description: "Notes on software, AI and the tools I use every day.",
    url: "/en/blog",
    type: "website",
  },
};

export default async function BlogIndexEn() {
  return <BlogIndexView lang="en" />;
}
