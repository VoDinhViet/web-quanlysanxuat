/**
 * Đơn vị tính — dùng chung cho mọi field "unit" (product / direct / BOM đều
 * tham chiếu cùng {id, code, name} này, mirrors the backend's UnitRefResDto).
 * Đặt ở global types vì nhiều feature dùng lại.
 */
export type Unit = {
  id: string
  code: string
  name: string
}

export const UnitType = {
  QUANTITY: "QUANTITY",
  WEIGHT: "WEIGHT",
  LENGTH: "LENGTH",
  VOLUME: "VOLUME",
} as const

export type UnitType = (typeof UnitType)[keyof typeof UnitType]

export const unitTypeLabels: Record<UnitType, string> = {
  [UnitType.QUANTITY]: "Số lượng",
  [UnitType.WEIGHT]: "Khối lượng",
  [UnitType.LENGTH]: "Chiều dài",
  [UnitType.VOLUME]: "Thể tích",
}

export const UnitStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const

export type UnitStatus = (typeof UnitStatus)[keyof typeof UnitStatus]

export const unitStatusLabels: Record<UnitStatus, string> = {
  [UnitStatus.ACTIVE]: "Hoạt động",
  [UnitStatus.INACTIVE]: "Ngừng hoạt động",
}

/** Mirrors the backend's UnitResDto (GET/POST/PATCH /units) — the full catalogue record for the
 * management screen; `Unit` above stays the narrow ref other features embed. */
export type UnitDetail = Unit & {
  type: UnitType
  status: UnitStatus
  updatedAt: string
}
