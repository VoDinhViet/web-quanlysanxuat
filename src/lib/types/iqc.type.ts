import type { SupplierRef } from "@/lib/types/supplier.type"
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

export const IqcStatus = {
  PENDING: "PENDING",
  WAITING_RETURN: "WAITING_RETURN",
  COMPLETED: "COMPLETED",
} as const

export type IqcStatus = (typeof IqcStatus)[keyof typeof IqcStatus]

export const iqcStatusLabels: Record<IqcStatus, string> = {
  [IqcStatus.PENDING]: "Chờ xử lý",
  [IqcStatus.WAITING_RETURN]: "Chờ trả NCC",
  [IqcStatus.COMPLETED]: "Hoàn thành",
}

/** Mirrors the backend's IqcBaseResDto (GET /api/iqc) — only the fields this list screen reads.
 *  `disposition` is only ever set when `result` is FAIL (DB check constraint
 *  `chk_iqc_inspections_disposition_requires_fail`); `purchaseOrder`/`reason` are the "PO / Lý do"
 *  column's two mutually-exclusive sources (see docs/domains/quality.md). */
export type Iqc = {
  id: string
  code: string
  inventoryReceipt: { id: string; code: string } | null
  purchaseOrder: { id: string; code: string } | null
  supplier: SupplierRef
  item: { id: string; code: string; name: string; unit: Unit }
  quantity: number
  inspectionDate: string
  result: IqcResult
  disposition: IqcDisposition | null
  status: IqcStatus
  reason: string | null
  note: string | null
  createdAt: string
}

/** Mirrors the backend's IqcStatsResDto (GET /api/iqc/stats) — raw counts, no backend-computed
 *  percentages (unlike OrderStats), so IqcStatCards derives each tile's percentage client-side. */
export type IqcStats = {
  total: number
  pass: number
  fail: number
  pending: number
  waitingReturn: number
  completed: number
}
