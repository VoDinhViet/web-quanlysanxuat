import { IqcResult } from "@/lib/types/iqc.type"
import type { IqcAttachment, IqcInspectionLevel } from "@/lib/types/iqc.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

// OQC (kiểm chất lượng đầu ra) tái dùng IqcResult/IqcInspectionLevel/aqlLevels và các label map
// của chúng thẳng từ iqc.type.ts — cùng khái niệm domain, đã sống ở `src/lib/types` (dùng chung
// toàn cục theo quy ước repo), không định nghĩa lại. Import trực tiếp ở call site:
// `import { IqcResult, iqcResultLabels, ... } from "@/lib/types/iqc.type"`.

export const OqcStatus = {
  NOT_INSPECTED: "NOT_INSPECTED",
  PENDING: "PENDING",
  REWORK: "REWORK",
  COMPLETED: "COMPLETED",
} as const

export type OqcStatus = (typeof OqcStatus)[keyof typeof OqcStatus]

export const oqcStatusLabels: Record<OqcStatus, string> = {
  [OqcStatus.NOT_INSPECTED]: "Chờ kiểm",
  [OqcStatus.PENDING]: "FAIL - chờ xử lý",
  [OqcStatus.REWORK]: "Đang rework",
  [OqcStatus.COMPLETED]: "Đã QC",
}

// For OqcStatusBadge-adjacent hint text — same idiom as iqcStatusDescriptions.
export const oqcStatusDescriptions: Record<OqcStatus, string> = {
  [OqcStatus.NOT_INSPECTED]: "Đã tạo, chờ QC nhập kết quả kiểm tra",
  [OqcStatus.PENDING]:
    "FAIL, chưa chọn hướng xử lý — QC lấy mẫu lại và xác nhận lại trên cùng phiếu",
  [OqcStatus.REWORK]:
    "FAIL, đã chọn xử lý REWORK — trả xưởng sửa lại, QC lấy mẫu lại và xác nhận lại trên cùng phiếu tới khi PASS",
  [OqcStatus.COMPLETED]:
    "PASS, hoặc FAIL đã ACCEPT/SCRAP — đã khoá vĩnh viễn, mở khoá nhập kho thành phẩm cho lô này",
}

// Cách xử lý khi `result = FAIL` — riêng của OQC, không dùng chung `IqcDisposition`
// (CONCESSION/SORT/RETURN, có khái niệm trả NCC) vì OQC là QC nội bộ sản xuất, không có NCC để trả
// hàng. `ACCEPT` — chấp nhận đặc biệt, dùng tiếp dù có lỗi. `REWORK` — trả xưởng sửa lại, phiếu vẫn
// mở (status → REWORK). `SCRAP` — loại bỏ hẳn, giải phóng lại quota lô của công đoạn.
export const OqcDisposition = {
  ACCEPT: "ACCEPT",
  REWORK: "REWORK",
  SCRAP: "SCRAP",
} as const

export type OqcDisposition =
  (typeof OqcDisposition)[keyof typeof OqcDisposition]

export const oqcDispositionLabels: Record<OqcDisposition, string> = {
  [OqcDisposition.ACCEPT]: "Chấp nhận đặc biệt",
  [OqcDisposition.REWORK]: "Trả xưởng sửa lại",
  [OqcDisposition.SCRAP]: "Loại bỏ (Scrap)",
}

// OQC's own PASS/FAIL hint text for OqcResultCard's radio cards — `iqc.type.ts`'s
// `iqcResultDescriptions` says "Vật tư" (material), the wrong noun on a finished-goods screen.
export const oqcResultDescriptions: Record<IqcResult, string> = {
  [IqcResult.PASS]: "Lô thành phẩm đạt yêu cầu, được phép nhập kho.",
  [IqcResult.FAIL]: "Lô thành phẩm không đạt — chọn hướng xử lý bên dưới.",
}

// For OqcDispositionCard's radio cards.
export const oqcDispositionDescriptions: Record<OqcDisposition, string> = {
  [OqcDisposition.ACCEPT]:
    "Chấp nhận dùng tiếp dù có lỗi, có ghi nhận ngoại lệ.",
  [OqcDisposition.REWORK]:
    "Trả xưởng sửa lại, QC kiểm lại trên cùng phiếu này tới khi PASS.",
  [OqcDisposition.SCRAP]:
    "Loại bỏ hẳn lô hàng — giải phóng lại quota lô của công đoạn.",
}

/** Mirrors the backend's PageOqcResDto (GET /api/oqc) — only the fields this list screen reads.
 *  `productionJob` is guaranteed present — the backend FK it's read through
 *  (`productionJobOperationId`) can't be orphaned: once a Job's LSX is `APPROVED`, nothing can
 *  delete its Job/operation/BOM-item rows anymore. `operation`/`bomItem` are read-only snapshots
 *  off the as-used operation/BOM node this OQC lot belongs to (not stored columns — joined at read
 *  time). `orderCode` is resolved at read time (productionJob → productionOrder → order), never
 *  stored. `result` is null until the first confirm. */
export type Oqc = {
  id: string
  code: string
  productionJob: { id: string; code: string }
  orderCode: string | null
  operation: { code: string; name: string }
  bomItem: { code: string; name: string }
  unit: Unit
  quantity: number
  inspectionDate: string
  result: IqcResult | null
  status: OqcStatus
  disposition: OqcDisposition | null
}

/** Mirrors the backend's OqcResDto (GET /api/oqc/:oqcId) — adds the AQL sampling fields over
 *  `Oqc`, all null until `POST /oqc/:oqcId/confirm` runs. `codeLetter`/`suggestedSampleSize`/`ac`/
 *  `re` are computed at response time from the same AQL lookup table IQC uses — advisory only,
 *  never blocks confirm. `resultAuto` is the server-derived PASS/FAIL from Ac/Re — `result` wins if
 *  QC sends one, otherwise falls back to `resultAuto`. `disposition`/`dispositionNote` (the latter
 *  only) only ever set when `result = FAIL` (DB check constraint). `status === COMPLETED` locks
 *  the sheet permanently (no un-complete route exists) — `REWORK` stays open for re-confirm.
 *  `qcEvidence`/`dispositionEvidence` are the latest attempt's attachments only (mirror IQC's
 *  `IqcDetail`) — `dispositionEvidence` is only ever populated when `result = FAIL`, same rule as
 *  `disposition`/`dispositionNote`.
 *  `item`/`note`/`creatorBy`/`createdAt` only exist on this detail response — the list response
 *  (`Oqc` above) doesn't send them, no list column reads them. `unit` is a sibling of `item`, NOT
 *  nested inside it — OQC's `item` is `ItemRefResDto` (no `unit`), unlike IQC's `ItemUnitRefResDto`
 *  (`unit` nested). Don't copy IQC's `item.unit` shape here again. */
export type OqcDetail = Oqc & {
  item: { id: string; code: string; name: string }
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
  inspectionLevel: IqcInspectionLevel | null
  aqlLevel: number | null
  codeLetter: string | null
  suggestedSampleSize: number | null
  sampleSize: number | null
  defectQty: number | null
  ac: number | null
  re: number | null
  resultAuto: IqcResult | null
  resultNote: string | null
  qcEvidence: IqcAttachment[]
  dispositionNote: string | null
  dispositionEvidence: IqcAttachment[]
  confirmerBy: UserRef | null
  confirmedAt: string | null
  resolverBy: UserRef | null
  resolvedAt: string | null
  updatedAt: string
}
