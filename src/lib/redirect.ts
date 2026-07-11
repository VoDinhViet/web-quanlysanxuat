export const DEFAULT_AUTHED_REDIRECT = "/manage"

/**
 * A `redirectTo` value reaches us from the URL, so an attacker controls it. Anything
 * that is not an unambiguous same-origin path is discarded rather than sanitised:
 * `//evil.com` and `/\evil.com` are both read as protocol-relative URLs by browsers.
 */
export function resolveInternalRedirect(target: string | undefined) {
  if (!target || !target.startsWith("/")) {
    return DEFAULT_AUTHED_REDIRECT
  }

  if (target.startsWith("//") || target.startsWith("/\\")) {
    return DEFAULT_AUTHED_REDIRECT
  }

  // Following a redirect back onto /login after a successful login would just show
  // the form again (or loop if it carries its own redirectTo).
  const pathname = target.split(/[?#]/, 1)[0] ?? target
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return DEFAULT_AUTHED_REDIRECT
  }

  return target
}
