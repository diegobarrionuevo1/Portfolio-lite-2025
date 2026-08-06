import { SectionLabel } from "@/components/ds";
import { ProjectCarousel } from "./project-carousel";
import { PROJECTS } from "./projects";

export function WorkSection() {
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
      <SectionLabel index="02" aside={`${PROJECTS.length.toString().padStart(2, "0")} proyectos`}>
        Trabajo seleccionado
      </SectionLabel>

      {PROJECTS.map((project) => (
        <ProjectCarousel key={project.id} project={project} />
      ))}
    </section>
  );
}
