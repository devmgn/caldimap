# Vercel Cron + Blob Scraper Design

## Goal

Automate the Kaldi store scraper to run on a schedule (Mon/Thu JST 6:00) using Vercel Cron Jobs, storing results in Vercel Blob instead of a static JSON file.

## Current State

- `scripts/scrape-stores.ts` runs manually via `pnpm scrape`
- Writes to `src/data/stores.json` (static file, bundled at build time)
- `app/page.tsx` (Server Component) imports JSON statically, passes to `MapPage`
- Client components receive data as props, no changes needed downstream

## Architecture

```
Vercel Cron (Mon/Thu 21:00 UTC = JST 6:00)
  -> GET /api/scrape (with CRON_SECRET auth)
    -> Fetch stores from Kaldi site
    -> Fetch sales from Kaldi site
    -> Read previous Blob data (coordinate cache)
    -> Geocode new stores only
    -> Write result to Vercel Blob (stores.json)

User request -> app/page.tsx (Server Component)
  -> Fetch stores.json from Blob URL
  -> Pass data to MapPage (no client changes needed)
```

## Components

### 1. `vercel.json` (new)

```json
{
  "crons": [
    {
      "path": "/api/scrape",
      "schedule": "0 21 * * 0,3"
    }
  ]
}
```

Note: `0 21 * * 0,3` = 21:00 UTC on Sun/Wed = JST 6:00 Mon/Thu

### 2. `src/app/api/scrape/route.ts` (new)

- GET handler triggered by Vercel Cron
- Validates `CRON_SECRET` from `Authorization` header
- Extracts scraping logic from `scripts/scrape-stores.ts` into shared module
- Reads previous Blob for coordinate cache
- Writes result to Vercel Blob
- Returns JSON response with store count

### 3. `src/lib/scraper.ts` (new)

Shared scraping logic extracted from `scripts/scrape-stores.ts`:
- `fetchStores()` - scrape store list
- `fetchSales()` - scrape sale info
- `geocodeNewStores()` - geocode only new stores using cached coordinates
- `buildStoresData()` - orchestrate and return StoresData

### 4. `src/lib/blob.ts` (new)

- `getStoresData()` - read stores.json from Blob
- `putStoresData(data)` - write stores.json to Blob

### 5. `src/app/page.tsx` (modify)

- Remove static `import storesData from "@/data/stores.json"`
- Fetch from Blob URL instead (server-side fetch with revalidation)
- Fallback to empty data if Blob not yet populated

### 6. `scripts/scrape-stores.ts` (modify)

- Import shared logic from `src/lib/scraper.ts`
- Keep as CLI tool for manual runs (writes to both Blob and local file)

## Environment Variables

| Variable | Purpose |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access (auto-set by Vercel) |
| `CRON_SECRET` | Auth for cron endpoint (set in Vercel dashboard) |
| `GOOGLE_GEOCODING_API_KEY` | Geocoding (already exists) |

## Security

- `/api/scrape` validates `Authorization: Bearer <CRON_SECRET>`
- Geocoding API key is server-side only
- Blob token is server-side only

## Free Tier Compatibility

| Resource | Free Limit | Expected Usage |
|---|---|---|
| Blob Storage | 250 MB | ~2-3 MB |
| Blob Bandwidth | 500 MB/month | Minimal |
| Cron Frequency | 1/day | 2/week |
| Function Timeout | 60s | ~5-15s typical |

## Fallback Strategy

- If Blob is empty (first deploy), `page.tsx` returns empty store list
- Manual `pnpm scrape` still works for initial data seeding
- Can trigger `/api/scrape` manually via curl for immediate update
