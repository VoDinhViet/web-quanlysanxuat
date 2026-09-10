import { describe, expect, it } from "vitest"
import { canAccessRoute } from "@/lib/route-permissions"
import { SUPER_PERMISSION } from "@/lib/types/permission.type"

describe("canAccessRoute", () => {
  it("allows access to unrestricted route /manage for any user", () => {
    expect(canAccessRoute("/manage", [])).toBe(true)
    expect(canAccessRoute("/manage", ["orders:read"])).toBe(true)
  })

  it("denies access when user lacks required permission", () => {
    expect(canAccessRoute("/manage/orders", [])).toBe(false)
    expect(canAccessRoute("/manage/orders", ["suppliers:read"])).toBe(false)
    expect(canAccessRoute("/manage/orders", ["orders:create"])).toBe(false)
  })

  it("allows access when user possesses the exact required permission", () => {
    expect(canAccessRoute("/manage/orders", ["orders:read"])).toBe(true)
    expect(canAccessRoute("/manage/users", ["users:update"])).toBe(true)
    expect(canAccessRoute("/manage/iqc", ["iqc:read"])).toBe(true)
    expect(canAccessRoute("/manage/products", ["items:read"])).toBe(true)
  })

  it("allows superadmin with system:manage to access any available route", () => {
    expect(canAccessRoute("/manage/orders", [SUPER_PERMISSION])).toBe(true)
    expect(canAccessRoute("/manage/users", [SUPER_PERMISSION])).toBe(true)
    expect(canAccessRoute("/manage/iqc", [SUPER_PERMISSION])).toBe(true)
    expect(canAccessRoute("/manage/outbound-orders", [SUPER_PERMISSION])).toBe(true)
  })
})
