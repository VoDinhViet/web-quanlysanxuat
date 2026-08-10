import type { SupplierRef } from "@/lib/types/supplier.type"

/** Mirrors the backend's `PurchaseQuotationStatus` (`be-quanlysanxuat/src/database/schemas/
 *  purchasing/purchase-quotations.ts`) exactly — no approval concept exists on this entity, only
 *  a send/receive lifecycle: `DRAFT → SENT (gửi NCC) → RECEIVED (NCC trả giá)`, or `CANCELLED`
 *  from `DRAFT`/`SENT`. */
export const PurchaseQuotationStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const

export type PurchaseQuotationStatus =
  (typeof PurchaseQuotationStatus)[keyof typeof PurchaseQuotationStatus]

export const purchaseQuotationStatusLabels: Record<
  PurchaseQuotationStatus,
  string
> = {
  [PurchaseQuotationStatus.DRAFT]: "Draft",
  [PurchaseQuotationStatus.SENT]: "Đã gửi",
  [PurchaseQuotationStatus.RECEIVED]: "Đã nhận báo giá",
  [PurchaseQuotationStatus.CANCELLED]: "Đã hủy",
}

export const purchaseQuotationStatusDescriptions: Record<
  PurchaseQuotationStatus,
  string
> = {
  [PurchaseQuotationStatus.DRAFT]: "Đang soạn, chưa gửi NCC",
  [PurchaseQuotationStatus.SENT]: "Đã gửi NCC, chờ báo giá",
  [PurchaseQuotationStatus.RECEIVED]: "NCC đã trả giá đủ các dòng",
  [PurchaseQuotationStatus.CANCELLED]: "Báo giá đã bị hủy",
}

/** Mirrors the backend's nested sender/receiver/creator relation (`UserRefResDto`), same shape
 *  as `PurchaseOrderCreatorRef`. */
export type PurchaseQuotationCreatorRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors `PageQuotationResDto` (`be-quanlysanxuat/src/api/purchase-quotations/dto/
 *  page-quotation.res.dto.ts`) exactly — the list response. `items` only needs `.length` on this
 *  screen ("Số vật tư"), so it's narrowed to a minimal ref rather than the full line shape (a
 *  detail-screen concern). `creatorBy` keeps its wire name here — renamed to `creator` in
 *  `PurchaseQuotationRow` below. NOTE: the list genuinely does not return `senderBy`/`sentAt`/
 *  `receiverBy`/`receivedAt` — `purchase-quotations.service.ts`'s `getQuotations()` only joins
 *  `supplier`/`creatorBy`/`items`. Those fields exist only on the detail response
 *  (`QuotationResDto`, `GET /purchase-quotations/:id`), not here. */
export type PurchaseQuotationApiRow = {
  id: string
  code: string
  supplier: SupplierRef
  status: PurchaseQuotationStatus
  quotationDate: string
  validUntil: string | null
  note: string | null
  items: { id: string }[]
  creatorBy: PurchaseQuotationCreatorRef | null
  createdAt: string
}

/** `itemCount`/`creator` aren't on the wire as-is (see `PurchaseQuotationApiRow` above) — mapped
 *  in `purchase-quotations.options.ts`'s `queryFn` right after fetching, same idiom as
 *  `PurchaseLedgerRow.warnings`. There is deliberately no `sender`/`sentAt`/`receiver`/
 *  `receivedAt` here — the list endpoint doesn't return them, so the "Ngày gửi"/"Ngày nhận báo
 *  giá" columns render `MissingFieldValue` instead of reading a row field. */
export type PurchaseQuotationRow = Omit<
  PurchaseQuotationApiRow,
  "items" | "creatorBy"
> & {
  itemCount: number
  creator: PurchaseQuotationCreatorRef | null
}
