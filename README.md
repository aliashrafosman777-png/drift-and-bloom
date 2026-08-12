# Drift & Bloom

A Next.js App Router storefront and administration application backed by MongoDB.

Fish products are read from and mutated through the shared product API. MongoDB is their only source of truth; product images are stored in Cloudinary.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- MongoDB/Mongoose persistence
- Cloudinary product image storage

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

## Fish product verification

```bash
npm test
npm run test:integration
npm run test:e2e
```

Integration and browser tests create a uniquely named isolated database, verify its name before cleanup, and never modify the configured application database. See `docs/fish-products-operations.md` for production migration and validation steps.

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
