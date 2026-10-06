import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { Impact } from "@/components/sections/impact";
import { WorkSection } from "@/components/work/work-section";
import { Experience } from "@/components/sections/experience";
import { Capabilities } from "@/components/sections/capabilities";
import { Building } from "@/components/sections/building";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { es: "/", en: "/en" },
  },
};

export default function Page() {
  return (
    <>
      <Nav />
      <Night />
      <RevealObserver />

      <main className="flex flex-col">
        <Hero />
        <Impact />
        <WorkSection />
        <Experience />
        <Capabilities />
        <Building />
        <About />
        <Contact />
      </main>
    </>
  );
}
