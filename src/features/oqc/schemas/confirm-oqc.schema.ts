import { z } from "zod"

import { IqcResult } from "@/lib/types/iqc.type"
import { OqcDisposition } from "@/lib/types/oqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"
import { fileFieldSchema } from "@/lib/file-field.schema"
import type { FileFieldValue } from "@/lib/file-field.schema"
import { emptyToUndefined, optionalEnum } from "@/lib/zod-transforms"

// Wire contract for POST /api/oqc/:oqcId/confirm — the single "Lưu" button of the whole detail
// page. Unlike confirm-iqc.schema.ts, there is no attachments/context fields group and no
// `inspectionDate` (not part of ConfirmOqcReqDto — OQC's inspection date is set once at
// create and shown read-only). `disposition`/`dispositionNote` only render (OqcDispositionCard)
// when `result` is live FAIL — optional here for the same reason IQC's are: not choosing a
// disposition is a valid save (→ PENDING). Also the client-side onDynamic validator.
export const confirmOqcSchema = z.object({
  oqcId: z.uuid(),
  result: z.enum(IqcResult),
  resultNote: z
    .string()
    .trim()
    .max(500, "Tối đa 500 ký tự")
    .transform(emptyToUndefined),
  qcEvidence: z.array(fileFieldSchema),
  disposition: optionalEnum(OqcDisposition),
  dispositionNote: z
    .string()
    .trim()
    .max(500, "Tối đa 500 ký tự")
    .transform(emptyToUndefined),
  dispositionEvidence: z.array(fileFieldSchema),
})

// The wire payload `confirmOqcSchema` accepts — what the mutation sends to `confirmOqc`.
export type ConfirmOqcSchema = z.input<typeof confirmOqcSchema>

// The form's own value type, hand-written rather than derived via `z.input` — `result` and
// `disposition` both start blank (no sensible default to preselect), which `z.enum(...)`'s input
// type can't represent. `onDynamic` narrows the blank cases out before calling the mutation (see
// OqcDetailForm.tsx's useOqcDetailForm).
export type ConfirmOqcFormValue = {
  oqcId: string
  result: IqcResult | ""
  resultNote: string
  qcEvidence: FileFieldValue[]
  disposition: OqcDisposition | ""
  dispositionNote: string
  dispositionEvidence: FileFieldValue[]
}

// Blank shape for `withForm`'s templating only (OqcResultCard/OqcDispositionCard) — the real
// values always come from `getOqcDefaultValues(oqc)` below, via `useAppForm` in
// OqcDetailForm.tsx's useOqcDetailForm.
export const confirmOqcFormDefaultValues: ConfirmOqcFormValue = {
  oqcId: "",
  result: "",
  resultNote: "",
  qcEvidence: [],
  disposition: "",
  dispositionNote: "",
  dispositionEvidence: [],
}

// The page is now a form that's always editable, seeded from the saved record (not a blank
// create form) — every field prefills from `oqc`, including a row still NOT_INSPECTED (all null
// on the backend, so every field below falls back to its own blank default).
export function getOqcDefaultValues(oqc: OqcDetail): ConfirmOqcFormValue {
  return {
    oqcId: oqc.id,
    result: oqc.result ?? "",
    resultNote: oqc.resultNote ?? "",
    qcEvidence: oqc.files
      .filter((qcFile) => qcFile.kind === "QC_EVIDENCE")
      .map((qcFile) => qcFile.file),
    disposition: oqc.disposition ?? "",
    dispositionNote: oqc.dispositionNote ?? "",
    dispositionEvidence: oqc.files
      .filter((qcFile) => qcFile.kind === "DISPOSITION_EVIDENCE")
      .map((qcFile) => qcFile.file),
  }
}
