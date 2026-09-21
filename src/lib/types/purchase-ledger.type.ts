import type { ItemRef } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's `PurchaseLedgerStatus` (`be-quanlysanxuat/src/api/purchase-ledger/
 *  purchase-ledger.constant.ts`) exactly — computed at read time from `quotedQuantity`/
 *  `orderedQuantity`/`receivedQuantity`, not a stored column. `COMPLETED` needs `receivedQuantity`
 *  (joined via `purchaseOrderItemId`, `POSTED` receipts), so it can't appear yet until
 *  `inventory-receipts` writes that link. `orderedQuantity` only counts PO status `ORDERED` (a
 *  `DRAFT` PO auto-generated from an approved RFQ doesn't count) — see `docs/domains/purchasing.md`
 *  in the backend repo. */
export const PurchaseLedgerStatus = {
  WAITING_TO_PURCHASE: "WAITING_TO_PURCHASE",
  QUOTING: "QUOTING",
  ORDERED: "ORDERED",
  COMPLETED: "COMPLETED",
} as const

export type PurchaseLedgerStatus =
  (typeof PurchaseLedgerStatus)[keyof typeof PurchaseLedgerStatus]

export const purchaseLedgerStatusLabels: Record<PurchaseLedgerStatus, string> =
  {
    [PurchaseLedgerStatus.WAITING_TO_PURCHASE]: "Chờ mua",
    [PurchaseLedgerStatus.QUOTING]: "Đang báo giá",
    [PurchaseLedgerStatus.ORDERED]: "Đã đặt hàng",
    [PurchaseLedgerStatus.COMPLETED]: "Hoàn tất",
  }

export const purchaseLedgerStatusDescriptions: Record<
  PurchaseLedgerStatus,
  string
> = {
  [PurchaseLedgerStatus.WAITING_TO_PURCHASE]: "Chưa có báo giá, chưa có PO",
  [PurchaseLedgerStatus.QUOTING]: "Có báo giá, chưa có PO",
  [PurchaseLedgerStatus.ORDERED]: "Có PO, chưa nhập đủ",
  [PurchaseLedgerStatus.COMPLETED]: "Đã nhập đủ",
}

/** Cảnh báo suy ra tại thời điểm đọc (không phải cột DB) — một dòng có thể mang cả hai cùng lúc.
 *  NO_PO: đã duyệt PR nhưng quá hạn vẫn chưa có PO nào. URGENT: sắp tới/đã qua ngày cần mà chưa
 *  hoàn tất. Cùng idiom với `Order.expired` — cờ tính sẵn ở tầng dữ liệu, cell chỉ đọc. */
export const PurchaseLedgerWarning = {
  NO_PO: "NO_PO",
  URGENT: "URGENT",
} as const

export type PurchaseLedgerWarning =
  (typeof PurchaseLedgerWarning)[keyof typeof PurchaseLedgerWarning]

export const purchaseLedgerWarningLabels: Record<
  PurchaseLedgerWarning,
  string
> = {
  [PurchaseLedgerWarning.NO_PO]: "Chưa tạo PO",
  [PurchaseLedgerWarning.URGENT]: "Cần xử lý gấp",
}

export const purchaseLedgerWarningDescriptions: Record<
  PurchaseLedgerWarning,
  string
> = {
  [PurchaseLedgerWarning.NO_PO]:
    "PR đã duyệt, SL đặt mua = 0, quá 1 ngày kể từ ngày tạo PR",
  [PurchaseLedgerWarning.URGENT]:
    "Còn dưới 1 ngày đến ngày cần mà vẫn chưa hoàn tất",
}

/** Mirrors the backend's `PurchaseRequestRefResDto` as nested on a ledger row — declared locally
 *  rather than imported from `purchase-request.type.ts`, same idiom as `OrderClientRef`: each
 *  domain owns its own ref shape even where it happens to coincide with another domain's. */
export type PurchaseLedgerPurchaseRequestRef = {
  id: string
  code: string
}

/** Mirrors the backend's `ProductionOrderRefResDto` as nested on a ledger row. `code` is nullable
 *  even when the object itself is present — null until the LSX is APPROVED. */
export type PurchaseLedgerProductionOrderRef = {
  id: string
  code: string | null
}

/** Mirrors the backend's `PurchaseLedgerItemResDto` (`GET /purchase-ledger`) exactly — one row per
 *  `purchase_request_items` line of an `APPROVED` purchase request. `productionOrder`/`note` are
 *  mutually exclusive in practice: `note` "hiển thị khi đề xuất không gắn LSX (productionOrder
 *  null)" per the backend DTO's own comment — a row shows one or the other, never both. */
export type PurchaseLedgerApiRow = {
  id: string
  purchaseRequest: PurchaseLedgerPurchaseRequestRef
  item: ItemRef
  unit: Unit
  productionOrder: PurchaseLedgerProductionOrderRef | null
  note: string | null
  quantity: number
  quotedQuantity: number
  orderedQuantity: number
  createdAt: string
  neededDate: string
  status: PurchaseLedgerStatus
}

/** `warnings` isn't on the wire — the backend deliberately only returns raw numbers
 *  (`orderedQuantity`, `neededDate`) so the warning always reflects the viewer's real clock
 *  instead of staying frozen at response time (`docs/domains/purchasing.md` in the backend repo).
 *  Attached client-side right after fetching (`purchase-ledger.options.ts`'s `queryFn`), via
 *  `resolvePurchaseLedgerWarnings` — same idiom as `Order.expired`, except computed on the FE
 *  instead of the BE since there's no backend column to read it from. */
export type PurchaseLedgerRow = PurchaseLedgerApiRow & {
  warnings: PurchaseLedgerWarning[]
}
