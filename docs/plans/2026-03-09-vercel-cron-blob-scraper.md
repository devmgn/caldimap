# Vercel Cron + Blob Scraper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automate Kaldi store scraper with Vercel Cron Jobs (Mon/Thu JST 6:00), storing results in Vercel Blob.

**Architecture:** Vercel Cron triggers API Route `/api/scrape` which scrapes Kaldi site, geocodes new stores, and writes JSON to Vercel Blob. Server Component in `page.tsx` fetches from Blob at request time. Scraping logic is extracted into a shared module used by both the API route and CLI script.

**Tech Stack:** Next.js 16 App Router, @vercel/blob, Cheerio, Google Geocoding API, Zod v4

---

### Task 1: Install @vercel/blob

**Files:**
- Modify: `package.json`

**Step 1: Install dependency**

Run: `pnpm add @vercel/blob`

**Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add @vercel/blob"
```

---

### Task 2: Create vercel.json with cron config

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/scrape",
      "schedule": "0 21 * * 0,3"
    }
  ]
}
```

Note: `0 21 * * 0,3` = 21:00 UTC Sun/Wed = JST 6:00 Mon/Thu

**Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel Cron config for scraper (Mon/Thu JST 6:00)"
```

---

### Task 3: Extract scraping logic into shared module

**Files:**
- Create: `src/lib/scraper.ts`
- Modify: `scripts/scrape-stores.ts`

**Step 1: Create `src/lib/scraper.ts`**

Extract all scraping functions from `scripts/scrape-stores.ts` into this module. The module exports pure functions with no filesystem or Blob dependencies — callers handle persistence.

Key exports:
- `fetchStores()` — scrape store list from Kaldi site
- `fetchSales()` — scrape sale info from Kaldi site
- `buildStoresData(cachedCoords, apiKey)` — orchestrate scraping, geocoding, and return `StoresData`

All helper functions (`parseServiceIcons`, `parseDateRange`, `padZero`, `geocodeAddress`) move here as private functions.

Import types from `@/features/map/types` (`StoresData`, `Store`).

**Step 2: Simplify `scripts/scrape-stores.ts` to use shared module**

Import `buildStoresData` from `../src/lib/scraper`. Keep only the CLI-specific logic: read existing JSON for coordinate cache, call `buildStoresData`, write result to filesystem.

**Step 3: Verify CLI still works**

Run: `pnpm scrape`
Expected: Scraper completes, `src/data/stores.json` is updated

**Step 4: Commit**

```bash
git add src/lib/scraper.ts scripts/scrape-stores.ts
git commit -m "refactor: extract scraping logic into shared module"
```

---

### Task 4: Create Blob utility module

**Files:**
- Create: `src/lib/blob.ts`

**Step 1: Create `src/lib/blob.ts`**

Two functions:

- `getStoresData()` — Use `list()` from `@vercel/blob` with prefix `"stores.json"` and limit 1. If no blobs found, return `null`. Otherwise fetch the blob URL and parse as `StoresData`.
- `putStoresData(data: StoresData)` — Use `put()` from `@vercel/blob` with `access: "public"`, `addRandomSuffix: false`, `contentType: "application/json"`. Return the blob URL.

**Step 2: Commit**

```bash
git add src/lib/blob.ts
git commit -m "feat: add Vercel Blob utility for stores data"
```

---

### Task 5: Create API Route for cron-triggered scraping

**Files:**
- Create: `src/app/api/scrape/route.ts`

**Step 1: Create the route handler**

- Export `GET(request: NextRequest)` (default export not needed — this is a route handler)
- Validate `Authorization: Bearer <CRON_SECRET>` header, return 401 if invalid
- Check `GOOGLE_GEOCODING_API_KEY` exists, return 500 if missing
- Load previous Blob data via `getStoresData()` for coordinate cache
- Call `buildStoresData(cachedCoords, apiKey)`
- Save via `putStoresData(data)`
- Return JSON `{ success: true, storeCount, url }`

**Step 2: Commit**

```bash
git add src/app/api/scrape/route.ts
git commit -m "feat: add /api/scrape cron endpoint with Blob storage"
```

---

### Task 6: Update page.tsx to fetch from Blob

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace static import with Blob fetch**

- Remove `import storesData from "@/data/stores.json"`
- Import `getStoresData` from `@/lib/blob`
- Make `Home` an `async` function
- Call `await getStoresData()`, fallback to `{ updatedAt: "", stores: [] }` if null
- Pass result to `<MapPage data={data} />`

No client-side component changes needed.

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds (Blob returns null locally without token — page renders with empty data)

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: fetch store data from Vercel Blob instead of static JSON"
```

---

### Task 7: Clean up static data file and update .gitignore

**Files:**
- Delete: `src/data/stores.json`
- Modify: `.gitignore`

**Step 1: Remove static JSON and update .gitignore**

```bash
git rm src/data/stores.json
```

Add `src/data/` to `.gitignore` so local `pnpm scrape` output is not committed.

**Step 2: Run checks**

Run: `pnpm check`
Expected: All checks pass (knip should not flag blob.ts or scraper.ts since they are imported)

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: remove static stores.json, fetch from Blob at runtime"
```

---

### Task 8: Add environment variables to Vercel (manual)

1. Vercel Dashboard -> Storage -> Create Blob Store -> Link to project
   (`BLOB_READ_WRITE_TOKEN` is auto-provisioned)
2. Vercel Dashboard -> Project -> Settings -> Environment Variables:
   - Add `CRON_SECRET` (random 32-char string)
   - Verify `GOOGLE_GEOCODING_API_KEY` is set

---

### Task 9: Deploy and verify

**Step 1:** Push branch and deploy preview
**Step 2:** Seed initial data via curl:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://<preview-url>/api/scrape
```

**Step 3:** Verify map loads with store data from Blob
**Step 4:** Check Vercel Dashboard -> Cron Jobs tab -> confirm schedule is registered
