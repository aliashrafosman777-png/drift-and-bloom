# Fish products: production operations

Fish products use MongoDB as the only catalog source of truth. The admin page and the fish package builder both call `/api/products?packageCategory=fish`; admin requests add the authenticated `includeInactive=true` option. Mutable product responses are marked `private, no-store`, and the client refreshes after every confirmed mutation.

Each environment's active database is the database selected by its
`MONGODB_URI`; local and production database names do not have to be identical.
All catalog items are stored in that database's `products` collection. In
Atlas, use `{ "packageCategory": "fish", "deletedAt": null }` to view current
fish products. Do not write to an empty `fish product` collection: the current
API, admin panel, package builder, and cart do not read it. A second fish-only
collection would split the source of truth and recreate the consistency
problem.

## Required production configuration

- `MONGODB_URI`: the production Atlas URI, including the intended database name.
- `EXPECTED_MONGODB_DATABASE`: strongly recommended. When configured, startup fails closed if it does not match the database selected by `MONGODB_URI`. Do not hardcode a fallback name because production and local environments may intentionally use different database names.
- `EXPECTED_MONGODB_HOST`: the Atlas cluster hostname. Startup fails closed when it does not match.
- `DATA_SOURCE_ID=production`: a safe environment label exposed as the `X-Data-Source` response header.
- `JWT_SECRET`: the production signing secret.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: required for durable product uploads.

Never put credentials in scripts or committed files. A database credential was previously present in `scripts/check-products.mjs`; rotate that Atlas credential before deployment even though it has been removed from the current source.

## Non-destructive migration

Take an Atlas snapshot first and run these commands against the exact production environment. Both scripts default to dry-run and print the selected database and planned changes.

```bash
node scripts/migrate-fish-products.mjs
node scripts/migrate-product-images.mjs
```

Review every unresolved category and duplicate reported by the metadata dry-run. The script performs no writes while either exists. After review:

```bash
FISH_MIGRATION_CONFIRMATION=NORMALIZE_FISH_METADATA_ONLY node scripts/migrate-fish-products.mjs --execute
IMAGE_MIGRATION_CONFIRMATION=MOVE_DATA_URLS_TO_CLOUDINARY node scripts/migrate-product-images.mjs --execute
```

The metadata migration normalizes category fields and creates the unique fish-name and listing indexes. It does not delete, reset, or reseed records. The image migration uploads legacy embedded `data:` images to Cloudinary and replaces only their stored URLs.

The old destructive fish cleanup script has been removed. The general seed script is blocked in production and requires both `--reset` and an explicit local-development confirmation.

## Deployment validation

1. Confirm `GET /api/products?packageCategory=fish&limit=100` returns `200`, `Cache-Control: private, no-store...`, and `X-Data-Source: production`.
2. In two normal browser profiles and one private profile, record identical Aquarium and Aquatic Life counts.
3. Create one product in each category and verify the POST responses contain stable 24-character MongoDB IDs and versions.
4. Refresh every profile and query the same records directly from the production database.
5. Edit one record, deactivate it, and verify it remains visible to the authenticated admin but not the public builder.
6. Add an active fish product to a package and confirm its current database price reaches the cart. Checkout revalidates the product, version, active state, and price server-side.
7. Soft-delete only the test records and verify unrelated IDs are unchanged.
8. Restart or redeploy, repeat the list query, and confirm the same IDs and versions remain.

Concurrent edits use MongoDB's `__v` version in the update/delete predicate. A stale mutation returns `409` and the admin client reloads the database record instead of preserving an optimistic change.
