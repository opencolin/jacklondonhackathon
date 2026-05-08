// No-op stub. The real session is now read by `<SiteHeader />` via `auth()`.
// This component is kept temporarily so the dashboard pages still type-check
// while a parallel agent removes the imports/JSX usages.
export function MarkLoggedIn() {
  return null;
}
