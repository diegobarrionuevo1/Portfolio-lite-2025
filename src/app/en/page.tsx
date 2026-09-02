import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { Impact } from "@/components/sections/impact";
import { WorkSection } from "@/components/work/work-section";
import { Capabilities } from "@/components/sections/capabilities";
import { Building } from "@/components/sections/building";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";

const TITLE = "Diego Barrionuevo — Full-stack software developer";
const DESCRIPTION =
  "I build products, automations and integrations that solve real business processes. Full stack, from discovery to deploy.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "/en",
    languages: { es: "/", en: "/en" },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/en",
    locale: "en_US",
    type: "website",
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function HomeEn() {
  return (
    <>
      <Nav lang="en" />
      <Night />
      <RevealObserver />
      <main className="flex flex-col">
        <Hero lang="en" />
        <Impact lang="en" />
        <WorkSection lang="en" />
        <Capabilities lang="en" />
        <Building lang="en" />
        <About lang="en" />
        <Contact lang="en" />
      </main>
    </>
  );
}
