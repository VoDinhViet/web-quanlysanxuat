import { DateTime } from "luxon"
import { z } from "zod"

import { AQL_LEVELS, IqcInspectionLevel } from "@/lib/types/iqc.type"
import {
  emptyToUndefined,
  isNonNegativeNumberString,
  isPositiveNumberString,
} from "@/lib/zod-transforms"

const AQL_LEVEL_VALUES: readonly number[] = AQL_LEVELS

// Wire contract for POST /api/iqc/:iqcId/confirm — shared by IqcAqlInputCard's form and the
// server function's validator. aqlLevel/sampleSize/defectQty travel as strings through the form
// (SelectField/NumberField only deal in strings) and transform to numbers here, same idiom as
// order-item-form.schema.ts. Server never trusts a client-computed result — it isn't part of
// this schema at all, see confirm-iqc.api.ts.
export const confirmIqcSchema = z.object({
  iqcId: z.uuid(),
  inspectionLevel: z.enum(IqcInspectionLevel),
  aqlLevel: z
    .string()
    .trim()
    .refine(
      (value) => AQL_LEVEL_VALUES.includes(Number(value)),
      "Vui lòng chọn mức AQL"
    )
    .transform(Number),
  sampleSize: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Cỡ mẫu phải lớn hơn 0")
    .transform(Number),
  defectQty: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Số lượng lỗi không được âm")
    .transform(Number),
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
  // `<input type="datetime-local">` value ("yyyy-MM-ddTHH:mm") — must parse at the local zone
  // (not `{zone:"utc"}` like `toIsoDate`/`emptyToUndefinedIsoDate` in zod-transforms.ts, which
  // are for date-only pickers): the value already carries the hour the user picked, so reading
  // it back as UTC would shift it by the local offset. Not reused as a shared helper — this is
  // the only datetime-local field in the codebase so far.
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
})

// The form's own value type, hand-written rather than derived via `z.input` —
// `inspectionLevel` starts blank (no sensible default AQL sampling level to preselect), which
// `z.enum(IqcInspectionLevel)`'s input type can't represent. `onSubmit` narrows the blank case
// out before calling the mutation (see IqcAqlInputCard.tsx).
export type ConfirmIqcFormValue = {
  iqcId: string
  inspectionLevel: IqcInspectionLevel | ""
  aqlLevel: string
  sampleSize: string
  defectQty: string
  inspectionStandard: string
  inspectorName: string
  measuringTools: string
  inspectionDate: string
}

// `inspectionDate` prefills from the IQC's own `inspectionDate` (set at creation) formatted for
// `<input type="datetime-local">` — the other 3 new fields have no sensible default, same as the
// existing AQL fields below.
export function buildConfirmIqcFormDefaultValues(
  iqcId: string,
  inspectionDate: string
): ConfirmIqcFormValue {
  return {
    iqcId,
    inspectionLevel: "",
    aqlLevel: "",
    sampleSize: "",
    defectQty: "",
    inspectionStandard: "",
    inspectorName: "",
    measuringTools: "",
    inspectionDate:
      DateTime.fromISO(inspectionDate).toFormat("yyyy-MM-dd'T'HH:mm"),
  }
}
