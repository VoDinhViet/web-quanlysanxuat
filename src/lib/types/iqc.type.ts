import type { ClientRef } from "@/lib/types/client.type"
import type { FileResource } from "@/lib/types/file.type"
import type { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { UserRef } from "@/lib/types/user.type"
import type { Unit } from "@/lib/types/unit.type"

export const IqcResult = {
  PASS: "PASS",
  FAIL: "FAIL",
} as const

export type IqcResult = (typeof IqcResult)[keyof typeof IqcResult]

export const iqcResultLabels: Record<IqcResult, string> = {
  [IqcResult.PASS]: "PASS",
  [IqcResult.FAIL]: "FAIL",
}

export const IqcDisposition = {
  CONCESSION: "CONCESSION",
  SORT: "SORT",
  RETURN: "RETURN",
} as const

export type IqcDisposition =
  (typeof IqcDisposition)[keyof typeof IqcDisposition]

export const iqcDispositionLabels: Record<IqcDisposition, string> = {
  [IqcDisposition.CONCESSION]: "Chấp nhận đặc biệt",
  [IqcDisposition.SORT]: "Phân loại",
  [IqcDisposition.RETURN]: "Trả NCC",
}

// For IqcResultCard's radio cards — one short sentence explaining what picking this result means.
export const iqcResultDescriptions: Record<IqcResult, string> = {
  [IqcResult.PASS]: "Vật tư đạt yêu cầu chất lượng kiểm tra.",
  [IqcResult.FAIL]: "Vật tư không đạt, cần chọn hướng xử lý bên dưới.",
}

// For IqcDispositionCard's radio cards.
export const iqcDispositionDescriptions: Record<IqcDisposition, string> = {
  [IqcDisposition.CONCESSION]:
    "Chấp nhận dùng dù không đạt, có ghi nhận ngoại lệ.",
  [IqcDisposition.SORT]:
    "Tách riêng phần đạt (OK) và phần lỗi (NG) trong lô hàng.",
  [IqcDisposition.RETURN]: "Trả toàn bộ lô hàng về nhà cung cấp.",
}

// Giá trị đổi 2026-08-29 (`NOT_INSPECTED→DRAFT`, `WAITING_RETURN→IN_PROGRESS`) — backend bỏ lớp
// dịch status, API giờ trả thẳng vocabulary DB (`docs/decisions/quality-schema-rename.md` ở
// be-quanlysanxuat, D5 cập nhật).
export const IqcStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const

export type IqcStatus = (typeof IqcStatus)[keyof typeof IqcStatus]

export const iqcStatusLabels: Record<IqcStatus, string> = {
  [IqcStatus.DRAFT]: "Chưa kiểm",
  [IqcStatus.PENDING]: "Chờ xử lý",
  [IqcStatus.IN_PROGRESS]: "Chờ trả NCC",
  [IqcStatus.COMPLETED]: "Hoàn thành",
}

// For IqcStatusLegend.tsx — same idiom as purchaseOrderStatusDescriptions.
export const iqcStatusDescriptions: Record<IqcStatus, string> = {
  [IqcStatus.DRAFT]: "Đã tạo, chờ QC nhập kết quả kiểm tra",
  [IqcStatus.PENDING]: "FAIL, đang chờ chọn hướng xử lý",
  [IqcStatus.IN_PROGRESS]: "Đang chờ trả hàng về NCC",
  [IqcStatus.COMPLETED]: "Đã hoàn tất kiểm tra (PASS hoặc đã xử lý xong)",
}

/** Mirrors the backend's PageIqcResDto (GET /api/iqc) — only the fields this list screen reads.
 *  `result` is null for a `NOT_INSPECTED` row (chưa kiểm); `disposition` is only ever
 *  set when `result` is FAIL (DB check constraint `chk_iqc_inspections_disposition_requires_fail`);
 *  `purchaseOrder`/`reason` are the "PO / Lý do" column's two mutually-exclusive sources (see
 *  docs/domains/quality.md). `supplier`/`client` are also mutually exclusive — `client` only set
 *  when the row was generated from a client RETURN receipt (BUG-038/065). */
export type Iqc = {
  id: string
  code: string
  inventoryReceipt: { id: string; code: string } | null
  purchaseOrder: { id: string; code: string } | null
  supplier: SupplierRef | null
  client: ClientRef | null
  // Snapshot mã/tên — luôn có; `item` null khi lô kiểm là node COMPONENT nhận về từ OS-IN (không phải
  // một item), khi đó chỉ còn `itemCode`/`itemName` để hiển thị.
  itemCode: string
  itemName: string
  item: { id: string; code: string; name: string; unit: Unit } | null
  quantity: number
  inspectionDate: string
  result: IqcResult | null
  disposition: IqcDisposition | null
  status: IqcStatus
  reason: string | null
  note: string | null
  createdAt: string
}

/** Mirrors the backend's QcFileResDto — one file entry inside `qcEvidence` /
 *  `dispositionEvidence` below (IQC) or the flat `files` array (OQC), discriminated by `kind`. */
export type QcFile = {
  id: string
  kind: "QC_EVIDENCE" | "DISPOSITION_EVIDENCE"
  file: FileResource
}

/** Mirrors the backend's IqcResDto (GET /api/iqc/:iqcId) — adds the confirm-time fields over
 *  `Iqc`, all null until `POST /iqc/:iqcId/confirm` runs. `result` is chosen by QC, not
 *  server-computed; `sortOkQty`/`sortNgQty` are only ever both set together, and only when
 *  `disposition === "SORT"` (DB CHECK constraints). `supplierReturn` is set once `status`
 *  reaches `WAITING_RETURN` (auto-generated DRAFT phiếu trả NCC). */
export type IqcDetail = Iqc & {
  resultNote: string | null
  qcEvidence: QcFile[]
  sortOkQty: number | null
  sortNgQty: number | null
  dispositionNote: string | null
  dispositionEvidence: QcFile[]
  supplierReturn: {
    id: string
    code: string
    status: InventoryDocumentStatus
  } | null
  confirmerBy: UserRef | null
  confirmedAt: string | null
  resolverBy: UserRef | null
  resolvedAt: string | null
  creatorBy: UserRef | null
  updatedAt: string
}

/** Mirrors the backend's IqcStatsResDto (GET /api/iqc/stats) — raw counts, no backend-computed
 *  percentages (unlike OrderStats), so IqcStatCards derives each tile's percentage client-side. */
export type IqcStats = {
  total: number
  notInspected: number
  pass: number
  fail: number
  pending: number
  waitingReturn: number
  completed: number
}
