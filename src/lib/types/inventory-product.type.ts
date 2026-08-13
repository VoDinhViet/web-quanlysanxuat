// Domain types for Finished Goods Inventory (Tồn kho thành phẩm)

export type InventoryProductStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"

export const inventoryProductStatusLabels: Record<
  InventoryProductStatus,
  string
> = {
  IN_STOCK: "Còn hàng",
  LOW_STOCK: "Sắp hết",
  OUT_OF_STOCK: "Hết hàng",
}

export type InventoryProductCategory =
  | "Bracket"
  | "Cover"
  | "Housing"
  | "Shaft"
  | "Gear"
  | "Panel"
  | "Frame"
  | "Other"

export const inventoryProductCategoryLabels: Record<
  InventoryProductCategory,
  string
> = {
  Bracket: "Giá đỡ (Bracket)",
  Cover: "Nắp đậy (Cover)",
  Housing: "Vỏ hộp (Housing)",
  Shaft: "Trục (Shaft)",
  Gear: "Bánh răng (Gear)",
  Panel: "Tấm tấm (Panel)",
  Frame: "Khung (Frame)",
  Other: "Khác",
}

export type InventoryProduct = {
  id: string
  code: string // e.g. TP-240501-001
  name: string // e.g. Bracket A
  imageUrl: string | null
  unit: string // e.g. pcs
  clientName: string // e.g. ABC Electronics
  poDemandQuantity: number // Tổng nhu cầu PO (chưa giao)
  actualQuantity: number // Tồn thực tế (đã QC đạt)
  reservedQuantity: number // Đã giữ (DO chưa giao)
  exportableQuantity: number // Có thể xuất (Tồn thực tế - Đã giữ)
  availableQuantity: number // Tồn TP khả dụng (Tồn thực tế - Tổng nhu cầu PO)
  category: InventoryProductCategory
  status: InventoryProductStatus
  poCodes: string[] // Related PO codes for search filtering
}
