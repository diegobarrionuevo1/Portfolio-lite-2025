import { ImageResponse } from "next/og";

/**
 * Typographic cover for a blog post.
 *
 * Posts get their feature image from this route rather than from an upload:
 * the pipeline only builds a URL, so there is nothing to rasterise, nothing to
 * store in Ghost, and no need to open Ghost's /content/ path to the internet.
 * It doubles as the social card, and a redesign here updates every past cover.
 */

// Satori needs real font buffers and the filesystem is not the place to get
// them on a serverless deploy. Fetching from the same deployment's public
// directory keeps one copy of each font in the repository.
export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

const CANVAS = "#f7f4ed";
const INK = "#0b0b0d";
const ACCENT = "#d63508";

/** Long titles must shrink rather than overflow the card. */
function titleSize(length: number): number {
  if (length <= 40) return 76;
  if (length <= 60) return 64;
  if (length <= 85) return 54;
  return 46;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const lang = searchParams.get("lang") === "en" ? "en" : "es";
  const raw = (searchParams.get("title") ?? "").trim();
  const fallback = lang === "en" ? "Workshop notes" : "Notas de taller";
  const title = raw === "" ? fallback : raw.slice(0, 120);

  const [display, serif] = await Promise.all([
    // A static instance on purpose: Satori cannot parse a variable font's
    // fvar table and dies with "Cannot read properties of undefined".
    fetch(new URL("/fonts/BricolageGrotesque-Display600.ttf", origin)).then((r) => r.arrayBuffer()),
    fetch(new URL("/fonts/InstrumentSerif-Italic.ttf", origin)).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CANVAS,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 3, background: ACCENT }} />
          <div
            style={{
              fontFamily: "Bricolage",
              fontSize: 22,
              letterSpacing: 4,
              color: INK,
              opacity: 0.55,
            }}
          >
            {lang === "en" ? "WORKSHOP NOTES" : "NOTAS DE TALLER"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Bricolage",
            fontSize: titleSize(title.length),
            lineHeight: 1.08,
            letterSpacing: -1.5,
            color: INK,
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 30 }}>
          <div style={{ fontFamily: "Bricolage", color: INK }}>Diego</div>
          <div style={{ fontFamily: "Serif", fontStyle: "italic", color: INK }}>Barrionuevo</div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Bricolage", data: display, style: "normal" },
        { name: "Serif", data: serif, style: "italic" },
      ],
    }
  );
}
