// Domain types for Outbound Orders (Giao hàng - DO)

export const OutboundOrderStatus = {
  DRAFT: "DRAFT",
  AWAITING_APPROVAL: "AWAITING_APPROVAL",
  AWAITING_DELIVERY_CONFIRMATION: "AWAITING_DELIVERY_CONFIRMATION",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const

export type OutboundOrderStatus =
  (typeof OutboundOrderStatus)[keyof typeof OutboundOrderStatus]

export const outboundOrderStatusLabels: Record<OutboundOrderStatus, string> = {
  [OutboundOrderStatus.DRAFT]: "Nháp",
  [OutboundOrderStatus.AWAITING_APPROVAL]: "Chờ duyệt",
  [OutboundOrderStatus.AWAITING_DELIVERY_CONFIRMATION]: "Chờ xác nhận giao",
  [OutboundOrderStatus.DELIVERED]: "Đã giao",
  [OutboundOrderStatus.CANCELLED]: "Đã hủy",
}

export const OutboundDeliveryMethod = {
  DOOR_DELIVERY: "DOOR_DELIVERY",
  EXPRESS_DELIVERY: "EXPRESS_DELIVERY",
  PICKUP_AT_WAREHOUSE: "PICKUP_AT_WAREHOUSE",
} as const

export type OutboundDeliveryMethod =
  (typeof OutboundDeliveryMethod)[keyof typeof OutboundDeliveryMethod]

export const outboundDeliveryMethodLabels: Record<
  OutboundDeliveryMethod,
  string
> = {
  [OutboundDeliveryMethod.DOOR_DELIVERY]: "Giao tận nơi",
  [OutboundDeliveryMethod.EXPRESS_DELIVERY]: "Giao nhanh",
  [OutboundDeliveryMethod.PICKUP_AT_WAREHOUSE]: "Nhận tại kho",
}

export type OutboundOrder = {
  id: string
  code: string // e.g. DO-250608-001
  createdAt: string
  clientName: string
  poOrReason: string
  deliveryMethod: OutboundDeliveryMethod
  totalQuantity: number // e.g. 120 (pcs)
  unit: string // pcs
  status: OutboundOrderStatus
  createdByName?: string
}

export type OutboundOrderItem = {
  id: string
  productCode: string
  productName: string
  unit: string
  orderedQuantity: number
  deliveredQuantity: number
  note: string | null
}

export type OutboundOrderStatusHistoryEntry = {
  status: OutboundOrderStatus
  changedAt: string
  changedBy: string | null
}

export type OutboundOrderDetail = OutboundOrder & {
  deliveryAddress: string | null
  driverName: string | null
  driverPhone: string | null
  note: string | null
  items: OutboundOrderItem[]
  statusHistory: OutboundOrderStatusHistoryEntry[]
}
