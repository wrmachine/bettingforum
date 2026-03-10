# 301 Redirect Configuration

All redirects return **301 Moved Permanently**—search engines and browsers cache these.

## Admin Tool

Go to **Admin → 301 Redirects** (`/admin/redirects`) to manage redirects. Add, edit, delete, or bulk import. Changes take effect immediately (1-minute cache).

## Bulk Import (Admin)

Paste one redirect per line. Separators: Tab, comma, or pipe.

```
/forum	/f/bet-general
/old-page	/new-page
/viewtopic.php	/threads
```

## Code-Based Rules

Edit `src/config/redirects.ts` for build-time rules:

- `LEGACY_REDIRECTS` — simple path mappings
- `WILDCARD_REDIRECTS` — patterns with `:path*` for catch-all
- Product type query params (`/products?type=X`) are built-in
