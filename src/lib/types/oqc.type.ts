import type { IqcResult, IqcInspectionLevel } from "@/lib/types/iqc.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

// OQC (kiểm chất lượng đầu ra) tái dùng IqcResult/IqcInspectionLevel/aqlLevels và các label map
// của chúng thẳng từ iqc.type.ts — cùng khái niệm domain, đã sống ở `src/lib/types` (dùng chung
// toàn cục theo quy ước repo), không định nghĩa lại. Import trực tiếp ở call site:
// `import { IqcResult, iqcResultLabels, ... } from "@/lib/types/iqc.type"`.

export const OqcStatus = {
  NOT_INSPECTED: "NOT_INSPECTED",
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
} as const

export type OqcStatus = (typeof OqcStatus)[keyof typeof OqcStatus]

export const oqcStatusLabels: Record<OqcStatus, string> = {
  [OqcStatus.NOT_INSPECTED]: "Chưa kiểm",
  [OqcStatus.PENDING]: "Chờ xử lý",
  [OqcStatus.COMPLETED]: "Hoàn thành",
}

// For OqcStatusBadge-adjacent hint text — same idiom as iqcStatusDescriptions.
export const oqcStatusDescriptions: Record<OqcStatus, string> = {
  [OqcStatus.NOT_INSPECTED]: "Đã tạo, chờ QC nhập kết quả kiểm tra",
  [OqcStatus.PENDING]: "FAIL — QC lấy mẫu lại và xác nhận lại trên cùng phiếu",
  [OqcStatus.COMPLETED]:
    "PASS — đã khoá vĩnh viễn, mở khoá nhập kho thành phẩm cho lô này",
}

/** Mirrors the backend's PageOqcResDto (GET /api/oqc) — only the fields this list screen reads.
 *  `productionJob` is guaranteed present — the backend FK it's read through
 *  (`productionJobOperationId`) can't be orphaned: once a Job's LSX is `APPROVED`, nothing can
 *  delete its Job/operation/BOM-item rows anymore. `orderCode` is resolved at read time
 *  (productionJob → productionOrder → order), never stored. `result` is null until the first
 *  confirm. */
export type Oqc = {
  id: string
  code: string
  productionJob: { id: string; code: string }
  orderCode: string | null
  item: { id: string; code: string; name: string; unit: Unit }
  quantity: number
  inspectionDate: string
  result: IqcResult | null
  status: OqcStatus
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
}

/** Mirrors the backend's OqcResDto (GET /api/oqc/:oqcId) — adds the AQL sampling fields over
 *  `Oqc`, all null until `POST /oqc/:oqcId/confirm` runs. `ac`/`re` are computed at response time
 *  from the same AQL lookup table IQC uses — advisory only, never blocks confirm. Unlike IQC,
 *  there's no disposition/attachments/qcDepartment — OQC's confirm payload is 6 fields, and
 *  `status === COMPLETED` locks the sheet permanently (no un-complete route exists). */
export type OqcDetail = Oqc & {
  inspectionLevel: IqcInspectionLevel | null
  aqlLevel: number | null
  sampleSize: number | null
  defectQty: number | null
  ac: number | null
  re: number | null
  resultNote: string | null
  confirmerBy: UserRef | null
  confirmedAt: string | null
  updatedAt: string
}
