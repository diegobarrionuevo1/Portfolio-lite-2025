import { SectionLabel } from "@/components/ds";
import type { Lang } from "@/lib/i18n";
import { ProjectCarousel } from "./project-carousel";
import { getProjects } from "./projects";

const COPY = {
  es: { heading: "Trabajo seleccionado", aside: "proyectos" },
  en: { heading: "Selected work", aside: "projects" },
} as const;

export function WorkSection({ lang = "es" }: { lang?: Lang } = {}) {
  const copy = COPY[lang];
  const projects = getProjects(lang);
  return (
    <section
      id="work"
      className="band-bleed"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-9)",
        padding: "var(--section-y) var(--page-margin)",
        ["--band-bg" as string]: "var(--surface-sunken)",
      }}
    >
      <SectionLabel
        index="02"
        aside={`${projects.length.toString().padStart(2, "0")} ${copy.aside}`}
      >
        {copy.heading}
      </SectionLabel>

      {projects.map((project) => (
        <ProjectCarousel key={project.id} project={project} lang={lang} />
      ))}
    </section>
  );
}
