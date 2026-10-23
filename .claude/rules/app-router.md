---
paths:
  - "src/app/**"
---

# Next.js App Router Rules

## Convention Files

Next.js convention files are the only files that sit flat in a route directory (everything else follows `directory-structure.md`) and the only non-story files allowed a default export:

`page.tsx`, `layout.tsx`, `template.tsx`, `default.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `global-not-found.tsx`, `forbidden.tsx`, `unauthorized.tsx`, `route.ts`, `sitemap.ts`

## Data Fetching

- Server Component: query the DB directly through `src/lib/db/queries/` and pass the result to Client Components as props
- Client Components receive data as props; there is no client-side data fetching library (copy TanStack Query from nextjs-boilerplate if one becomes necessary)

### Under Cache Components

`cacheComponents: true` is enabled, so route segment configs such as `dynamic = "force-dynamic"` are not allowed, and uncached data is read during prerendering unless the component opts into request-time rendering.

DB queries are not detected as dynamic, so move them into a dedicated component that calls `await connection()` (`next/server`) first, and wrap it in `<Suspense>` in the calling `page.tsx`. Reference: `src/app/(map)/_components/map-page-container/`

## Files That Bypass the Root Layout

`global-error.tsx` and `global-not-found.tsx` are not rendered inside the root layout, so they provide their own `<html>` / `<body>` and import `../lib/styles/globals.css`.

|  | Rendered when | Component | metadata |
| --- | --- | --- | --- |
| `global-error.tsx` | An uncaught error in the root layout / template | Client only | Not supported (use `<title>`) |
| `global-not-found.tsx` | A URL matches no route | Server OK | Supported |
| `not-found.tsx` | `notFound()` is called | Server OK | Supported (rendered inside the root layout) |
