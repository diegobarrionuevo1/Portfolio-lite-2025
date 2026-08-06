import { Button, SectionLabel } from "@/components/ds";
import { Clock } from "@/components/site/clock";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const CONTACTS = [
  { label: "Email", value: "diegobarrionuevo11@gmail.com", href: "mailto:diegobarrionuevo11@gmail.com" },
  { label: "LinkedIn", value: "/in/diegobarrionuevo11", href: "https://www.linkedin.com/in/diegobarrionuevo11/" },
  { label: "GitHub", value: "@diegobarrionuevo1", href: "https://github.com/diegobarrionuevo1" },
];

export function Contact() {
  return (
    <footer
      id="contact"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-10)",
        padding: "var(--section-y) var(--page-margin) var(--space-7)",
        borderTop: "1px solid var(--border-hairline)",
      }}
    >
      <SectionLabel index="06" aside="Respondo en menos de 24 h">
        Contacto
      </SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <h2
          data-reveal
          style={{
            margin: 0,
            maxWidth: "20ch",
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-display-2)",
            fontWeight: 500,
            letterSpacing: "var(--ls-display-2)",
            lineHeight: "var(--lh-display)",
            textWrap: "balance",
          }}
        >
          ¿Estás construyendo algo
          <em
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: 0,
              color: "var(--text-accent)",
            }}
          >
            ?
          </em>
        </h2>
        <p
          data-reveal
          data-delay="70"
          style={{
            margin: 0,
            maxWidth: "var(--measure-lede)",
            fontSize: "var(--fs-body-lg)",
            lineHeight: "var(--lh-body)",
            letterSpacing: "var(--ls-lede)",
            color: "var(--text-secondary)",
          }}
        >
          Estoy disponible para oportunidades remotas, proyectos de software y colaboraciones con equipos de producto.
          Contame qué estás construyendo.
        </p>
        <div data-reveal data-delay="130" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <Button variant="accent" size="lg" arrow href="mailto:diegobarrionuevo11@gmail.com">
            Escribime
          </Button>
          <Button variant="outline" size="lg" href="/cv-diego-barrionuevo.pdf" download="Diego Barrionuevo - CV.pdf">
            Descargar CV
          </Button>
        </div>
      </div>

      <div
        data-reveal
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
          gap: "var(--space-5)",
          paddingTop: "var(--space-6)",
          borderTop: "1px solid var(--border-hairline)",
        }}
      >
        {CONTACTS.map((c) => (
          <div key={c.label} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <span style={mono}>{c.label}</span>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ fontSize: "var(--fs-body-sm)" }}
            >
              {c.value}
            </a>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          paddingTop: "var(--space-5)",
          borderTop: "1px solid var(--border-hairline)",
          ...mono,
          letterSpacing: "var(--ls-caps-tight)",
        }}
      >
        <span>© 2026 Diego Barrionuevo</span>
        <span>
          Córdoba, Argentina · GMT−3 <Clock />
        </span>
      </div>
    </footer>
  );
}
