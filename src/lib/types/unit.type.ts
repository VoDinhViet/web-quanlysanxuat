/**
 * Đơn vị tính — dùng chung cho mọi field "unit" (product / material / BOM đều
 * tham chiếu cùng {id, code, name} này, từ GET /api/units). Mirrors the backend's
 * nested unit relation; đặt ở global types vì nhiều feature dùng lại.
 */
export type Unit = {
  id: string
  code: string
  name: string
}
