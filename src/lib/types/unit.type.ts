/**
 * Đơn vị tính — dùng chung cho mọi field "unit" (product / material / BOM đều
 * tham chiếu cùng {id, code, name} này, mirrors the backend's UnitRefResDto).
 * Đặt ở global types vì nhiều feature dùng lại.
 */
export type Unit = {
  id: string
  code: string
  name: string
}

/** Only the two scopes the Đơn vị tính admin screen offers — the backend's `UnitScope` also has
 *  `SEMI_FINISHED`, but no module reads it yet, so it isn't exposed here. */
export type UnitScope = "MATERIAL" | "PRODUCT"

export const unitScopeLabels: Record<UnitScope, string> = {
  MATERIAL: "Vật tư",
  PRODUCT: "Sản phẩm",
}

/** Mirrors the backend's UnitResDto (GET /api/units, GET /api/units/:id) — the detail shape used
 *  by the Đơn vị tính admin screen. Nested `unit` fields elsewhere stay on the plain `Unit` shape
 *  above, since the backend doesn't send `scopes` there. */
export type UnitDetail = Unit & {
  scopes: UnitScope[]
}
