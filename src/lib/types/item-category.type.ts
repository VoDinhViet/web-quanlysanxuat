/** Nhóm vật tư — mirrors the backend's ItemCategoryRefResDto, embedded by `Direct`. */
export type ItemCategoryRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's ItemCategoryResDto (GET/POST/PATCH /item-categories) — the full record
 * for the management screen; `ItemCategoryRef` stays the narrow ref other features embed. */
export type ItemCategory = ItemCategoryRef & {
  description: string | null
  updatedAt: string
}
