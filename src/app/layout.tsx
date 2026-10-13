import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { siteUrl } from "@/components/blog/shared";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font. globals.css maps these variables to
// --font-display/--font-serif, --font-sans and --font-mono.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: "normal",
  variable: "--font-plex-mono",
  display: "swap",
});

const NAME = "Diego Barrionuevo";
const TITLE = "Diego Barrionuevo — Desarrollador de software full stack";
const DESCRIPTION =
  "Construyo productos, automatizaciones e integraciones que resuelven procesos reales de negocio. Full stack, del relevamiento al deploy.";

// Same source as the sitemap, the RSS feed and robots.txt. Deriving the
// canonical from a separate hardcoded value let it drift to the non-www host,
// which 308-redirects — so every canonical pointed at a redirect while the
// sitemap advertised the final URL.
const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: `%s | ${NAME}`,
  },
  description: DESCRIPTION,
  applicationName: NAME,
  authors: [{ name: NAME, url: SITE }],
  creator: NAME,
  keywords: [
    "Diego Barrionuevo",
    "desarrollador full stack",
    "full stack developer",
    "desarrollador de software",
    "Next.js",
    "Node.js",
    "React",
    "TypeScript",
    "PostgreSQL",
    "automatización",
    "Córdoba",
    "Argentina",
    "remoto",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: NAME,
    locale: "es_AR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
    card: "summary_large_image",
  },
  verification: {
    google: "",
    yandex: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sourceSerif.variable} ${inter.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light">
          <div
            style={{
              position: "relative",
              maxWidth: "var(--page-max)",
              margin: "0 auto",
              background: "var(--surface-canvas)",
            }}
          >
            {children}
          </div>
        </ThemeProvider>
        {/* Ghost counts nothing here: it never serves a reader, only the API
            calls this site makes. Page views have to be measured on this end. */}
        <Analytics />
      </body>
    </html>
  );
}
