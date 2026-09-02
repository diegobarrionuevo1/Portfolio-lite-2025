import type { Metadata } from "next";
import { BlogIndexView } from "@/components/blog/index-page";

// Posts are published daily by the automation, so the index must refresh
// without a redeploy. The Ghost webhook also flushes this on publish.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notas sobre desarrollo de software, IA y las herramientas que uso todos los días. Análisis propio, sin humo.",
  alternates: {
    canonical: "/blog",
    languages: { es: "/blog", en: "/en/blog" },
  },
  openGraph: {
    title: "Blog | Diego Barrionuevo",
    description:
      "Notas sobre desarrollo de software, IA y las herramientas que uso todos los días.",
    url: "/blog",
    type: "website",
  },
};

export default async function BlogIndex() {
  return <BlogIndexView lang="es" />;
}
