import { describe, expect, it } from "vitest"

import {
  DEFAULT_AUTHED_REDIRECT,
  resolveInternalRedirect,
} from "@/lib/redirect"

describe("resolveInternalRedirect", () => {
  it("keeps a same-origin path", () => {
    expect(resolveInternalRedirect("/manage/users")).toBe("/manage/users")
  })

  it("keeps a path with a query string", () => {
    expect(resolveInternalRedirect("/manage?page=2")).toBe("/manage?page=2")
  })

  it("falls back when there is no target", () => {
    expect(resolveInternalRedirect(undefined)).toBe(DEFAULT_AUTHED_REDIRECT)
    expect(resolveInternalRedirect("")).toBe(DEFAULT_AUTHED_REDIRECT)
  })

  it.each([
    ["//evil.com", "protocol-relative URL"],
    ["/\\evil.com", "backslash the browser normalises to //"],
    ["https://evil.com", "absolute URL"],
    ["javascript:alert(1)", "javascript scheme"],
    ["manage", "relative path with no leading slash"],
    ["/login", "the login page itself"],
    ["/login?redirectTo=/manage", "login page with a query string"],
    ["/login/", "login page with a trailing slash"],
  ])("rejects %s (%s)", (target) => {
    expect(resolveInternalRedirect(target)).toBe(DEFAULT_AUTHED_REDIRECT)
  })
})
