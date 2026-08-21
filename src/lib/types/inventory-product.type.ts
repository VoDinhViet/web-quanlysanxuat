// Domain types for Finished Goods Inventory (Tồn kho thành phẩm)

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
  poCodes: string[] // Related PO codes for search filtering
}
