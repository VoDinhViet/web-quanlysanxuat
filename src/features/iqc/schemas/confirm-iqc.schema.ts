import { DateTime } from "luxon"
import { z } from "zod"

import {
  aqlLevels,
  IqcDisposition,
  IqcInspectionLevel,
  IqcResult,
} from "@/lib/types/iqc.type"
import { fileFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined, optionalEnum } from "@/lib/zod-transforms"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { IqcDetail } from "@/lib/types/iqc.type"

const aqlLevelValues: readonly number[] = aqlLevels

// numeric(18,3) on the backend — comparing raw floats risks 0.1+0.2 !== 0.3 style mismatches.
// Mirrors IqcService.validateDecision's own `scale`.
function scale(value: number): number {
  return Math.round(value * 1000)
}

// Wire contract for POST /api/iqc/:iqcId/confirm — now the single "Lưu" button of the whole
// detail page (shared by every section card's form.AppField, all under one <form> in
// IqcDetailForm.tsx), not a one-shot AQL-only confirm. Also the client-side onSubmit validator.
// `totalQuantity` is FE-only (seeded from the IQC's own `quantity`, never sent — dropped by
// confirm-iqc.api.ts's payload transform) — carried here purely so the SORT split's cross-field
// check below has something to compare against, since this schema is a module-level constant and
// can't close over a specific record's `quantity`.
export const confirmIqcSchema = z
  .object({
    iqcId: z.uuid(),
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
    inspectionStandard: z
      .string()
      .trim()
      .max(100, "Tối đa 100 ký tự")
      .transform(emptyToUndefined),
    inspectorName: z
      .string()
      .trim()
      .max(100, "Tối đa 100 ký tự")
      .transform(emptyToUndefined),
    measuringTools: z
      .string()
      .trim()
      .max(255, "Tối đa 255 ký tự")
      .transform(emptyToUndefined),
    // `<input type="datetime-local">` value — parsed at the local zone, not `{zone:"utc"}` (see
    // the original comment this was copied from, still accurate).
    inspectionDate: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || DateTime.fromISO(value).isValid,
        "Ngày kiểm tra không hợp lệ"
      )
      .transform((value) =>
        value.length > 0
          ? DateTime.fromISO(value).toJSDate().toISOString()
          : undefined
      ),
    result: z.enum(IqcResult),
    resultNote: z
      .string()
      .trim()
      .max(500, "Tối đa 500 ký tự")
      .transform(emptyToUndefined),
    qcDepartmentId: z.string().trim().transform(emptyToUndefined),
    qcEvidence: z.array(fileFieldSchema),
    // Optional even for a FAIL row — no disposition picked yet is a valid save (→ PENDING).
    disposition: optionalEnum(IqcDisposition),
    sortOkQty: z.number().optional(),
    sortNgQty: z.number().optional(),
    dispositionNote: z
      .string()
      .trim()
      .max(500, "Tối đa 500 ký tự")
      .transform(emptyToUndefined),
    dispositionEvidence: z.array(fileFieldSchema),
    totalQuantity: z.number(),
  })
  .superRefine((value, ctx) => {
    if (value.result === IqcResult.PASS && value.disposition) {
      ctx.addIssue({
        code: "custom",
        path: ["disposition"],
        message: "Kết quả PASS thì không được chọn phương án xử lý",
      })
    }

    if (value.disposition !== IqcDisposition.SORT) {
      return
    }

    if (value.sortOkQty === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["sortOkQty"],
        message: "Vui lòng nhập SL OK",
      })
    }
    if (value.sortNgQty === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["sortNgQty"],
        message: "Vui lòng nhập SL NG",
      })
    }
    if (value.sortOkQty === undefined || value.sortNgQty === undefined) {
      return
    }

    if (
      scale(value.sortOkQty + value.sortNgQty) !== scale(value.totalQuantity)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sortNgQty"],
        message: "SL OK + SL NG phải bằng Tổng SL",
      })
    }
  })

// The form's own value type, hand-written rather than derived via `z.input` — `inspectionLevel`,
// `result` and `disposition` all start blank (no sensible default to preselect), which
// `z.enum(...)`'s input type can't represent. `onSubmit` narrows the blank cases out before
// calling the mutation (see use-iqc-detail-form.ts).
export type ConfirmIqcFormValue = {
  iqcId: string
  inspectionLevel: IqcInspectionLevel | ""
  aqlLevel: string
  sampleSize?: number
  defectQty?: number
  inspectionStandard: string
  inspectorName: string
  measuringTools: string
  inspectionDate: string
  result: IqcResult | ""
  resultNote: string
  qcDepartmentId: string
  qcEvidence: FileFieldValue[]
  disposition: IqcDisposition | ""
  sortOkQty?: number
  sortNgQty?: number
  dispositionNote: string
  dispositionEvidence: FileFieldValue[]
  totalQuantity: number
}

// The page is now a form that's always editable, seeded from the saved record (not a blank
// create form) — every field prefills from `iqc`, including a row still NOT_INSPECTED (all
// null on the backend, so every field below falls back to its own blank default).
export function getIqcDefaultValues(iqc: IqcDetail): ConfirmIqcFormValue {
  return {
    iqcId: iqc.id,
    inspectionLevel: iqc.inspectionLevel ?? "",
    aqlLevel: iqc.aqlLevel !== null ? String(iqc.aqlLevel) : "",
    sampleSize: iqc.sampleSize ?? undefined,
    defectQty: iqc.defectQty ?? undefined,
    inspectionStandard: iqc.inspectionStandard ?? "",
    inspectorName: iqc.inspectorName ?? "",
    measuringTools: iqc.measuringTools ?? "",
    inspectionDate: DateTime.fromISO(iqc.inspectionDate).toFormat(
      "yyyy-MM-dd'T'HH:mm"
    ),
    result: iqc.result ?? "",
    resultNote: iqc.resultNote ?? "",
    qcDepartmentId: iqc.qcDepartment?.id ?? "",
    qcEvidence: iqc.qcEvidence.map((attachment) => attachment.file),
    disposition: iqc.disposition ?? "",
    sortOkQty: iqc.sortOkQty ?? undefined,
    sortNgQty: iqc.sortNgQty ?? undefined,
    dispositionNote: iqc.dispositionNote ?? "",
    dispositionEvidence: iqc.dispositionEvidence.map(
      (attachment) => attachment.file
    ),
    totalQuantity: iqc.quantity,
  }
}
