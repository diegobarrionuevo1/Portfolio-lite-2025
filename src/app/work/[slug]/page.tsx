import type { Metadata } from "next";
import {
  buildShowcaseMetadata,
  ShowcaseView,
  showcaseStaticParams,
} from "@/components/work/showcase/showcase-page";

// Every showcase is known at build time: an unknown slug is a 404, never an
// on-demand render.
export const dynamicParams = false;

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return showcaseStaticParams();
}

export function generateMetadata({ params }: Props): Metadata {
  return buildShowcaseMetadata(params.slug, "es");
}

export default function WorkShowcasePage({ params }: Props) {
  return <ShowcaseView slug={params.slug} lang="es" />;
}
