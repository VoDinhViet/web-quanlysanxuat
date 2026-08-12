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

// AQL sampling (POST /iqc/:iqcId/confirm) — xem docs/domains/quality.md ở backend.
export const IqcInspectionLevel = {
  I: "I",
  II: "II",
  III: "III",
} as const

export type IqcInspectionLevel =
  (typeof IqcInspectionLevel)[keyof typeof IqcInspectionLevel]

export const iqcInspectionLevelLabels: Record<IqcInspectionLevel, string> = {
  [IqcInspectionLevel.I]: "Mức I",
  [IqcInspectionLevel.II]: "Mức II",
  [IqcInspectionLevel.III]: "Mức III",
}

// Khớp CHECK `chk_iqc_inspections_aql_level_valid` ở backend — mọi nơi cần liệt kê 6 mức này (ô
// chọn AQL Level ở IqcAqlInputCard) đọc từ đây, không lặp lại mảng số.
export const AQL_LEVELS = [0.65, 1.0, 1.5, 2.5, 4.0, 6.5] as const

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
  NOT_INSPECTED: "NOT_INSPECTED",
  PENDING: "PENDING",
  WAITING_RETURN: "WAITING_RETURN",
  COMPLETED: "COMPLETED",
} as const

export type IqcStatus = (typeof IqcStatus)[keyof typeof IqcStatus]

export const iqcStatusLabels: Record<IqcStatus, string> = {
  [IqcStatus.NOT_INSPECTED]: "Chưa kiểm",
  [IqcStatus.PENDING]: "Chờ xử lý",
  [IqcStatus.WAITING_RETURN]: "Chờ trả NCC",
  [IqcStatus.COMPLETED]: "Hoàn thành",
}

// For IqcStatusLegend.tsx — same idiom as purchaseOrderStatusDescriptions.
export const iqcStatusDescriptions: Record<IqcStatus, string> = {
  [IqcStatus.NOT_INSPECTED]: "Đã tạo, chưa chạy AQL sampling",
  [IqcStatus.PENDING]: "FAIL, đang chờ chọn hướng xử lý",
  [IqcStatus.WAITING_RETURN]: "Đang chờ trả hàng về NCC",
  [IqcStatus.COMPLETED]: "PASS, đã hoàn tất kiểm tra",
}

/** Mirrors the backend's PageIqcResDto (GET /api/iqc) — only the fields this list screen reads.
 *  `result` is null for a `NOT_INSPECTED` row (chưa chạy AQL sampling); `disposition` is only ever
 *  set when `result` is FAIL (DB check constraint `chk_iqc_inspections_disposition_requires_fail`);
 *  `purchaseOrder`/`reason` are the "PO / Lý do" column's two mutually-exclusive sources (see
 *  docs/domains/quality.md). */
export type Iqc = {
  id: string
  code: string
  inventoryReceipt: { id: string; code: string } | null
  purchaseOrder: { id: string; code: string } | null
  supplier: SupplierRef
  item: { id: string; code: string; name: string; unit: Unit }
  quantity: number
  inspectionDate: string
  result: IqcResult | null
  disposition: IqcDisposition | null
  status: IqcStatus
  reason: string | null
  note: string | null
  createdAt: string
}

/** Mirrors the backend's IqcResDto (GET /api/iqc/:iqcId) — adds the AQL sampling fields over
 *  `Iqc`, all null until `POST /iqc/:iqcId/confirm` runs. `ac`/`re` are computed at response time
 *  from the AQL lookup table (`iqc-aql.constant.ts` ở backend), not stored columns. */
export type IqcDetail = Iqc & {
  inspectionLevel: IqcInspectionLevel | null
  aqlLevel: number | null
  sampleSize: number | null
  defectQty: number | null
  inspectionStandard: string | null
  inspectorName: string | null
  measuringTools: string | null
  ac: number | null
  re: number | null
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
