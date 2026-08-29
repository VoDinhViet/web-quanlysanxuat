import type { ClientRef } from "@/lib/types/client.type"
import type { Department } from "@/lib/types/department.type"
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
export const aqlLevels = [0.65, 1.0, 1.5, 2.5, 4.0, 6.5] as const

// Shape của GET /api/iqc/aql-plan và GET /api/oqc/aql-plan (cùng backend `AqlPlanResDto`, dùng
// chung — cả 2 hook use-iqc-aql-plan.ts/use-oqc-aql-verdict.ts trả về type này).
export type AqlPlan = {
  codeLetter: string
  sampleSize: number
  ac: number
  re: number
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
  [IqcResult.PASS]: "Vật tư đạt yêu cầu chất lượng, cho phép nhập kho.",
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
 *  `result` is null for a `NOT_INSPECTED` row (chưa chạy AQL sampling); `disposition` is only ever
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

/** Mirrors the backend's QcFileResDto — one file entry inside `qcEvidence` /
 *  `dispositionEvidence` below (IQC) or the flat `files` array (OQC), discriminated by `kind`. */
export type QcFile = {
  id: string
  kind: "QC_EVIDENCE" | "DISPOSITION_EVIDENCE"
  file: FileResource
}

/** Mirrors the backend's IqcResDto (GET /api/iqc/:iqcId) — adds the AQL sampling fields over
 *  `Iqc`, all null until `POST /iqc/:iqcId/confirm` runs. `ac`/`re` are computed at response time
 *  from the AQL lookup table (`iqc-aql.constant.ts` ở backend), not stored columns — a plan the
 *  table doesn't cover comes back null, and confirm never blocks on it (advisory only). `result`
 *  is chosen by QC, not server-computed; `sortOkQty`/`sortNgQty` are only ever both set together,
 *  and only when `disposition === "SORT"` (DB CHECK constraints). `supplierReturn` is set once
 *  `status` reaches `WAITING_RETURN` (auto-generated DRAFT phiếu trả NCC). */
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
  resultNote: string | null
  qcDepartment: Department | null
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
