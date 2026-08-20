import { z } from "zod"

import { aqlLevels, IqcInspectionLevel, IqcResult } from "@/lib/types/iqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"
import { emptyToUndefined } from "@/lib/zod-transforms"

const aqlLevelValues: readonly number[] = aqlLevels

// Wire contract for POST /api/oqc/:oqcId/confirm — the single "Lưu" button of the whole detail
// page. Unlike confirm-iqc.schema.ts, there is no disposition/attachments/qcDepartment/context
// fields group and no `inspectionDate` (not part of ConfirmOqcReqDto — OQC's inspection date is
// set once at create and shown read-only). Also the client-side onSubmit validator.
export const confirmOqcSchema = z.object({
  oqcId: z.uuid(),
  inspectionLevel: z.enum(IqcInspectionLevel),
  aqlLevel: z
    .string()
    .trim()
    .refine(
      (value) => aqlLevelValues.includes(Number(value)),
      "Vui lòng chọn mức AQL"
    )
    .transform(Number),
  sampleSize: z
    .number("Cỡ mẫu phải lớn hơn 0")
    .positive("Cỡ mẫu phải lớn hơn 0")
    .optional()
    .pipe(z.number("Cỡ mẫu phải lớn hơn 0")),
  defectQty: z
    .number("Số lượng lỗi không được âm")
    .min(0, "Số lượng lỗi không được âm")
    .optional()
    .pipe(z.number("Số lượng lỗi không được âm")),
  result: z.enum(IqcResult),
  resultNote: z
    .string()
    .trim()
    .max(500, "Tối đa 500 ký tự")
    .transform(emptyToUndefined),
})

// The form's own value type, hand-written rather than derived via `z.input` — `inspectionLevel`
// and `result` both start blank (no sensible default to preselect), which `z.enum(...)`'s input
// type can't represent. `onSubmit` narrows the blank cases out before calling the mutation (see
// use-oqc-detail-form.ts).
export type ConfirmOqcFormValue = {
  oqcId: string
  inspectionLevel: IqcInspectionLevel | ""
  aqlLevel: string
  sampleSize?: number
  defectQty?: number
  result: IqcResult | ""
  resultNote: string
}

// The page is now a form that's always editable, seeded from the saved record (not a blank
// create form) — every field prefills from `oqc`, including a row still NOT_INSPECTED (all null
// on the backend, so every field below falls back to its own blank default).
export function getOqcDefaultValues(oqc: OqcDetail): ConfirmOqcFormValue {
  return {
    oqcId: oqc.id,
    inspectionLevel: oqc.inspectionLevel ?? "",
    aqlLevel: oqc.aqlLevel !== null ? String(oqc.aqlLevel) : "",
    sampleSize: oqc.sampleSize ?? undefined,
    defectQty: oqc.defectQty ?? undefined,
    result: oqc.result ?? "",
    resultNote: oqc.resultNote ?? "",
  }
}
