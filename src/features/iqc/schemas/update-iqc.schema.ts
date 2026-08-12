import { DateTime } from "luxon"
import { z } from "zod"

import { emptyToNull } from "@/lib/zod-transforms"
import type { IqcDetail } from "@/lib/types/iqc.type"

// Wire contract for PATCH /api/iqc/:iqcId — shared by the inline edit form in
// IqcAqlInputCard.tsx and the server function's validator. Only the 4 contextual fields set at
// confirm time can be corrected afterwards (Inspection Level/AQL Level/sample size/defect qty
// stay locked, see UpdateIqcReqDto on the backend). PATCH semantics: an explicit `""` clears the
// 3 text fields to `null` (emptyToNull, same idiom as update-client.schema.ts) — not
// emptyToUndefined like confirm-iqc.schema.ts, since here "" is an active edit, not "not
// provided yet". `inspectionDate` stays non-nullable (the column is NOT NULL) — parsed at the
// local zone like confirm-iqc.schema.ts's own inspectionDate field, duplicated rather than
// shared since this is a separate action with its own schema file per repo convention.
export const updateIqcSchema = z.object({
  iqcId: z.uuid(),
  inspectionStandard: z
    .string()
    .trim()
    .max(100, "Tối đa 100 ký tự")
    .transform(emptyToNull),
  inspectorName: z
    .string()
    .trim()
    .max(100, "Tối đa 100 ký tự")
    .transform(emptyToNull),
  measuringTools: z
    .string()
    .trim()
    .max(255, "Tối đa 255 ký tự")
    .transform(emptyToNull),
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

export type UpdateIqcFormValue = {
  iqcId: string
  inspectionStandard: string
  inspectorName: string
  measuringTools: string
  inspectionDate: string
}

export function buildUpdateIqcFormDefaultValues(
  detail: IqcDetail
): UpdateIqcFormValue {
  return {
    iqcId: detail.id,
    inspectionStandard: detail.inspectionStandard ?? "",
    inspectorName: detail.inspectorName ?? "",
    measuringTools: detail.measuringTools ?? "",
    inspectionDate: DateTime.fromISO(detail.inspectionDate).toFormat(
      "yyyy-MM-dd'T'HH:mm"
    ),
  }
}
