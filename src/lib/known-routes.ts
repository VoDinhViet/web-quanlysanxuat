/**
 * Full URL paths that actually resolve to a route today. TanStack Router's `<Link to>`
 * only type-checks against registered paths, so any href pointing outside this list
 * (sidebar placeholders for domains that don't have a page yet) falls back to a plain
 * `<a>` — client-side navigation to a route that doesn't exist isn't meaningfully
 * different from a full page load to a 404.
 */
const KNOWN_ROUTES = [
  "/manage",
  "/manage/users",
  "/manage/users/add",
  "/manage/products",
] as const

export type KnownRoute = (typeof KNOWN_ROUTES)[number]

export function isKnownRoute(path: string): path is KnownRoute {
  return (KNOWN_ROUTES as readonly string[]).includes(path)
}
