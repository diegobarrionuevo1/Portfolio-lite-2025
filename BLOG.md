# Blog — Ghost headless + publicación diaria automática

El blog vive en `/blog` dentro del portfolio. Ghost es solo el CMS (headless): guarda
los posts y expone la API; **todo lo que ve el visitante lo renderiza Next.js** con el
design system Contraste.

```
GitHub Actions (cron 12:00 UTC = 09:00 AR)
   automation/run.ts
     1. Ingesta RSS de fuentes verificadas
     2. Descarta lo ya cubierto (dedup)
     3. Elige el tema del día (señal cruzada entre fuentes)
     4. Genera TU análisis con Claude (no reescribe la nota ajena)
     5. Control de calidad → publica o deja borrador
                │
                ▼  Admin API (JWT)
          ┌───────────┐
          │   Ghost   │  self-hosted, Docker + SQLite
          └─────┬─────┘
                │  Content API + webhook de revalidación
                ▼
     Next.js /blog + /blog/[slug]
     sitemap.xml · rss.xml · robots.txt · JSON-LD
```

## Por qué RSS y no scraping

Google penaliza explícitamente el *scraped content*, y desde 2024 tiene la política de
*scaled content abuse* que apunta a publicar contenido generado en masa sin valor
agregado. Un blog que republica notas ajenas hunde el SEO del dominio en vez de
levantarlo. Los feeds RSS, en cambio, se publican **para** ser sindicados: son legales,
estables y no se rompen cuando la fuente cambia el HTML.

Por eso el pipeline no reescribe la noticia: genera **tu análisis** sobre ella, citando
y enlazando la fuente. Eso es contenido original, y es lo que diferencia al blog.

## Ojo con el SEO en headless

Ghost tiene buen SEO **en su propio front-end**, que acá no se usa. Al consumirlo por
API, todo el SEO lo hace la capa de Next.js — por eso están implementados a mano:
metadata dinámica, Open Graph, Twitter Cards, canonical, JSON-LD (`BlogPosting`),
`sitemap.xml`, `rss.xml` y `robots.txt`.

**Importante:** no expongas el Ghost a Google. Si `blog.tudominio.com` queda indexable
y además servís el mismo contenido en `/blog`, tenés contenido duplicado compitiendo
contra vos mismo. Dejá el Ghost detrás de un subdominio con `noindex`, o directamente
sin DNS público (solo accesible para la app y para vos).

---

## Setup local (una vez)

Ghost ya está levantado en Docker.

```bash
docker compose -f ghost/docker-compose.yml up -d
```

**1. Creá tu cuenta de owner** en http://localhost:2368/ghost — esto lo hacés vos, no lo
automatizo (crear cuentas y manejar contraseñas es tuyo).

**2. Creá una integración** en Ghost: `Settings → Integrations → Add custom integration`,
llamala "Portfolio". Te da dos claves:
- **Content API Key** — solo lectura, la usa el sitio.
- **Admin API Key** (formato `id:secret`) — la usa el pipeline para publicar. **Secreta.**

**3. Copiá las claves** a `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:4000
GHOST_URL=http://localhost:2368
GHOST_CONTENT_API_KEY=<content api key>
GHOST_ADMIN_API_KEY=<admin api key, formato id:secret>
ANTHROPIC_API_KEY=<tu api key de Anthropic>
REVALIDATE_SECRET=<openssl rand -hex 32>
BLOG_AUTO_PUBLISH=false
```

Probá el pipeline sin escribir nada en Ghost:

```bash
pnpm blog:daily:dry
```

## Producción (self-host)

Mismo `ghost/docker-compose.yml`, en el servidor donde ya corre el portfolio:

1. Poné `GHOST_URL` con la URL pública real (Ghost la usa para generar links).
2. Serví Ghost detrás del reverse proxy con TLS.
3. Bloqueá su indexación (subdominio con `noindex` o sin DNS público).
4. Cargá las mismas variables en el entorno de la app.
5. En Ghost, agregá un webhook (`Settings → Integrations → tu integración → Add webhook`)
   para el evento **Post published**, apuntando a
   `https://tudominio.com/api/revalidate`, con el header `x-revalidate-secret`.
   Eso hace que un post nuevo aparezca al instante en vez de esperar la ventana de ISR.

El volumen `ghost_data` guarda la base SQLite y las imágenes: **incluilo en tus backups**.

## Publicación diaria

Corre por GitHub Actions todos los días a las 09:00 de Argentina. Los secrets van en
`Settings → Secrets and variables → Actions` del repo:

`GHOST_URL`, `GHOST_ADMIN_API_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`,
`REVALIDATE_SECRET`, `BLOG_AUTO_PUBLISH`.

### Borrador vs auto-publicar

Por defecto **todo sale como borrador**. Con `BLOG_AUTO_PUBLISH` sin definir (o en
cualquier valor que no sea exactamente `true`), el pipeline nunca publica solo.

Cuando lo pongas en `true`, publica automáticamente **solo si pasa el control de
calidad**: que las fuentes citadas existan y respondan, que el cuerpo enlace a la
fuente, que el largo sea razonable, y que el HTML sea válido para Ghost. Si algo falla,
queda en borrador y el log dice exactamente por qué.

Mi recomendación: dejalo en borrador la primera semana, leé lo que genera, y recién ahí
activá el auto-publicado. Es tu cara profesional frente a clientes.
