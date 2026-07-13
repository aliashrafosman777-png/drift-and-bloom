# Drift & Bloom — Next.js Migration

A production-ready Next.js App Router version of the original Drift & Bloom React + Vite storefront.

The visual design, Tailwind theme, animations, routes, local-data flows, mock authentication, admin screens, cart behavior, package builder, and quiz experience were preserved while migrating the runtime to Next.js, TypeScript, App Router, optimized images, metadata, sitemap, and robots support.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Local mock data and browser storage contexts

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL, usually `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Type check

```bash
npm run type-check
```

## Demo accounts

- Customer login/register: any name, email, and password works because auth is mocked locally.
- Admin login: use the demo credentials shown on `/admin/login`.
  - Email: `admin@driftandbloom.com`
  - Password: `admin123`

## Routes

| Route | Description |
| --- | --- |
| `/` | Home — hero, curated collections, best sellers, promos, about, and how it works |
| `/packages` | Packages — search, category filter, sort, responsive grid |
| `/packages/[id]` | Product details — gallery, plant options, quantity, related products |
| `/build-your-package` | Package builder entry URL |
| `/build-package` | Backward-compatible package builder URL |
| `/cart` | Cart, order summary, checkout form, order confirmation |
| `/find-your-soul` | Multi-step recommendation quiz |
| `/support` | Contact form, contact info, FAQ accordion |
| `/login`, `/register` | Customer auth pages with mock local state |
| `/admin/login` | Admin auth page with mock local state |
| `/admin` | Admin dashboard |
| `/admin/products` | Admin package management |
| `/admin/orders` | Admin orders |
| `/admin/customers` | Admin customer list |

## Folder structure

```text
public/
  assets/                 Static images moved from the Vite src/assets folder
  favicon.svg
src/
  app/                    Next.js App Router pages, layouts, metadata, robots, sitemap
  components/             Preserved UI components grouped by feature
  context/                Preserved local mock state providers
  data/                   Preserved local product/admin/recommendation data
  layouts/                Main, admin, and auth layout shells
  routes/                 Protected route compatibility wrapper
  utils/                  Shared utilities
  views/                  Migrated former React Router page components
```

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the production origin before deployment so canonical URLs, sitemap entries, Open Graph metadata, and structured data use the correct domain.

The app is ready for Vercel and standard Node hosting. A basic `netlify.toml` is included for Netlify's Next.js support.

## Migration notes

See `MIGRATION_NOTES.md` for the full migration summary, changed file inventory, validation notes, and route mapping.
