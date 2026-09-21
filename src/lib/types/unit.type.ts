/**
 * Đơn vị tính — dùng chung cho mọi field "unit" (product / consumable / BOM đều
 * tham chiếu cùng {id, code, name} này, mirrors the backend's UnitRefResDto).
 * Đặt ở global types vì nhiều feature dùng lại.
 */
export type Unit = {
  id: string
  code: string
  name: string
}
