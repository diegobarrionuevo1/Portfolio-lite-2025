import type { Metadata } from "next";
import { buildPostMetadata, PostView, postStaticParams } from "@/components/blog/post-page";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return postStaticParams("en");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPostMetadata(params.slug, "en");
}

export default async function PostPage({ params }: Props) {
  return <PostView slug={params.slug} lang="en" />;
}
