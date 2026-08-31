import { InventoryReceiptType } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import { InventoryIssueType } from "@/lib/types/inventory-issue.type"
import type { UserRef } from "@/lib/types/user.type"

// Local twins — id+code (plus the couple of extra fields the backend's XRefResDto actually
// returns), not the full XRef types other features use. Kept local rather than importing across
// features, same convention as InventoryMaterialTableCells.tsx's "Local twin" comment.
export type ProductLedgerReceiptRef = {
  id: string
  code: string
  status: InventoryReceiptStatus
  receiptType: InventoryReceiptType
  receiptDate: string
}

export type ProductLedgerIssueRef = {
  id: string
  code: string
  issueType: InventoryIssueType
}

export type ProductLedgerJobRef = {
  id: string
  code: string
}

export type ProductLedgerOrderRef = {
  id: string
  code: string
}

export type ProductLedgerOutboundOrderRef = {
  id: string
  code: string
}

/**
 * Mirrors the backend's ProductLedgerEntryResDto (GET /api/inventory-products/:itemId/ledger) —
 * one row of a finished good's stock ledger ("thẻ kho"), tồn luỹ kế (`balanceAfter`) sau giao
 * dịch này. Exactly one of `inventoryReceipt`/`inventoryIssue` is non-null per row. The backend
 * deliberately doesn't classify a "loại giao dịch" — this screen derives that itself, see
 * `resolveProductLedgerMovementType` below.
 */
export type ProductLedgerEntry = {
  id: string
  transactionDate: string
  createdAt: string
  /** Có dấu — dương là nhập, âm là xuất. */
  quantity: number
  balanceAfter: number
  inventoryReceipt: ProductLedgerReceiptRef | null
  inventoryIssue: ProductLedgerIssueRef | null
  productionJob: ProductLedgerJobRef | null
  order: ProductLedgerOrderRef | null
  outboundOrder: ProductLedgerOutboundOrderRef | null
  note: string | null
  creatorBy: UserRef | null
}

// Phân loại "Loại giao dịch" cho cột badge của bảng thẻ kho — thuần FE, backend chỉ trả nguyên
// liệu (quantity, inventoryReceipt.receiptType/inventoryIssue.issueType).
export const ProductLedgerMovementType = {
  PRODUCTION_RECEIPT: "PRODUCTION_RECEIPT",
  CUSTOMER_RETURN: "CUSTOMER_RETURN",
  PURCHASE_RECEIPT: "PURCHASE_RECEIPT",
  DELIVERY: "DELIVERY",
  ADJUSTMENT: "ADJUSTMENT",
  OTHER_ISSUE: "OTHER_ISSUE",
  REVERSAL: "REVERSAL",
} as const

export type ProductLedgerMovementType =
  (typeof ProductLedgerMovementType)[keyof typeof ProductLedgerMovementType]

export const productLedgerMovementTypeLabels: Record<
  ProductLedgerMovementType,
  string
> = {
  [ProductLedgerMovementType.PRODUCTION_RECEIPT]: "Nhập từ sản xuất",
  [ProductLedgerMovementType.CUSTOMER_RETURN]: "Khách trả hàng",
  [ProductLedgerMovementType.PURCHASE_RECEIPT]: "Nhập mua hàng",
  [ProductLedgerMovementType.DELIVERY]: "Giao hàng (DO)",
  [ProductLedgerMovementType.ADJUSTMENT]: "Điều chỉnh",
  [ProductLedgerMovementType.OTHER_ISSUE]: "Xuất khác",
  [ProductLedgerMovementType.REVERSAL]: "Đảo bút toán (huỷ phiếu)",
}

// `REVERSAL` xét trước mọi giá trị khác — bút toán đảo lúc huỷ phiếu dùng lại đúng
// receiptType/issueType của chứng từ gốc, chỉ dấu `quantity` trái ngược bản chất chứng từ (phiếu
// nhập ra số âm, phiếu xuất ra số dương) mới phân biệt được. Mirrors be-quanlysanxuat's đã-gỡ
// `resolveProductStockMovementType` (chuyển hẳn xuống FE theo yêu cầu, không còn ở backend).
export function resolveProductLedgerMovementType(
  ledger: Pick<
    ProductLedgerEntry,
    "quantity" | "inventoryReceipt" | "inventoryIssue"
  >
): ProductLedgerMovementType {
  if (ledger.inventoryReceipt) {
    if (ledger.quantity < 0) {
      return ProductLedgerMovementType.REVERSAL
    }
    switch (ledger.inventoryReceipt.receiptType) {
      case InventoryReceiptType.PRODUCTION:
        return ProductLedgerMovementType.PRODUCTION_RECEIPT
      case InventoryReceiptType.RETURN:
        return ProductLedgerMovementType.CUSTOMER_RETURN
      case InventoryReceiptType.PURCHASE:
        return ProductLedgerMovementType.PURCHASE_RECEIPT
    }
  }

  if (ledger.inventoryIssue) {
    if (ledger.quantity > 0) {
      return ProductLedgerMovementType.REVERSAL
    }
    switch (ledger.inventoryIssue.issueType) {
      case InventoryIssueType.SALES:
        return ProductLedgerMovementType.DELIVERY
      default:
        return ProductLedgerMovementType.OTHER_ISSUE
    }
  }

  return ledger.quantity >= 0
    ? ProductLedgerMovementType.ADJUSTMENT
    : ProductLedgerMovementType.OTHER_ISSUE
}
