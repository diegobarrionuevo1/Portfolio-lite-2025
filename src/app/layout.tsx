import { ThemeProvider } from "@/components/theme-provider";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import "./globals.css";

const NAME = "Diego Barrionuevo";
const TITLE = "Diego Barrionuevo — Desarrollador de software full stack";
const DESCRIPTION =
  "Construyo productos, automatizaciones e integraciones que resuelven procesos reales de negocio. Full stack, del relevamiento al deploy.";

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: TITLE,
    template: `%s | ${NAME}`,
  },
  description: DESCRIPTION,
  applicationName: NAME,
  authors: [{ name: NAME, url: DATA.url }],
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
    url: DATA.url,
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
    <html lang="es" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
