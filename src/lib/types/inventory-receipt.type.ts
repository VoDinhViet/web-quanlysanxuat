// Domain types for Inventory Receipts (Phiếu nhập kho).

export const InventoryReceiptStatus = {
  DRAFT: "DRAFT",
  AWAITING_IQC: "AWAITING_IQC",
  AWAITING_RECEIPT: "AWAITING_RECEIPT",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const

export type InventoryReceiptStatus =
  (typeof InventoryReceiptStatus)[keyof typeof InventoryReceiptStatus]

export const inventoryReceiptStatusLabels: Record<InventoryReceiptStatus, string> =
  {
    [InventoryReceiptStatus.DRAFT]: "Draft",
    [InventoryReceiptStatus.AWAITING_IQC]: "Chờ IQC",
    [InventoryReceiptStatus.AWAITING_RECEIPT]: "Chờ nhập kho",
    [InventoryReceiptStatus.RECEIVED]: "Đã nhập kho",
    [InventoryReceiptStatus.CANCELLED]: "Hủy",
  }

export const inventoryReceiptStatusDescriptions: Record<
  InventoryReceiptStatus,
  string
> = {
  [InventoryReceiptStatus.DRAFT]: "Phiếu đang soạn thảo, chưa gửi đi.",
  [InventoryReceiptStatus.AWAITING_IQC]: "Đã gửi yêu cầu kiểm tra chất lượng.",
  [InventoryReceiptStatus.AWAITING_RECEIPT]: "Đã qua IQC, chờ nhập kho.",
  [InventoryReceiptStatus.RECEIVED]: "Hoàn tất nhập kho.",
  [InventoryReceiptStatus.CANCELLED]: "Phiếu đã bị hủy.",
}

export const InventoryReceiptSource = {
  PURCHASE_ORDER: "PURCHASE_ORDER",
  CUSTOMER_MATERIAL: "CUSTOMER_MATERIAL",
  PRODUCTION_RETURN: "PRODUCTION_RETURN",
  OTHER_ADJUSTMENT: "OTHER_ADJUSTMENT",
} as const

export type InventoryReceiptSource =
  (typeof InventoryReceiptSource)[keyof typeof InventoryReceiptSource]

export const inventoryReceiptSourceLabels: Record<
  InventoryReceiptSource,
  string
> = {
  [InventoryReceiptSource.PURCHASE_ORDER]: "Nhập từ PO",
  [InventoryReceiptSource.CUSTOMER_MATERIAL]: "Nhập từ vật tư khách hàng",
  [InventoryReceiptSource.PRODUCTION_RETURN]: "Nhập trả vật tư sản xuất",
  [InventoryReceiptSource.OTHER_ADJUSTMENT]: "Nhập điều chỉnh khác",
}

export const AssetType = {
  COMPANY_MATERIAL: "COMPANY_MATERIAL",
  CUSTOMER_MATERIAL: "CUSTOMER_MATERIAL",
} as const

export type AssetType = (typeof AssetType)[keyof typeof AssetType]

export const assetTypeLabels: Record<AssetType, string> = {
  [AssetType.COMPANY_MATERIAL]: "Vật tư công ty",
  [AssetType.CUSTOMER_MATERIAL]: "Vật tư khách hàng",
}

export type InventoryReceipt = {
  id: string
  code: string
  receiptDate: string
  source: InventoryReceiptSource
  poOrReason: string
  assetType: AssetType
  status: InventoryReceiptStatus
  createdByName: string
}

export type InventoryReceiptItem = {
  id: string
  materialCode: string
  materialName: string
  unit: string
  docQuantity: number
  actualQuantity: number
  passedQuantity: number
  failedQuantity: number
  note: string | null
}

export type InventoryReceiptStatusHistoryEntry = {
  status: InventoryReceiptStatus
  changedAt: string
  changedBy: string | null
}

export type InventoryReceiptDetail = InventoryReceipt & {
  warehouseName: string
  delivererName: string | null
  note: string | null
  items: InventoryReceiptItem[]
  statusHistory: InventoryReceiptStatusHistoryEntry[]
}
