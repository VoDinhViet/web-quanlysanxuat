import { z } from "zod"

import { IqcDisposition } from "@/lib/types/iqc.type"

// Wire contract for POST /api/iqc/:iqcId/resolve — shared by IqcDispositionCard's form and the
// server function's validator. Same idiom as confirm-iqc.schema.ts.
export const resolveIqcSchema = z.object({
  iqcId: z.uuid(),
  disposition: z.enum(IqcDisposition),
})

// The form's own value type, hand-written rather than derived via `z.input` — `disposition`
// starts blank (no sensible default to preselect), which `z.enum(IqcDisposition)`'s input type
// can't represent. `onSubmit` narrows the blank case out before calling the mutation (see
// IqcDispositionCard.tsx), same pattern as ConfirmIqcFormValue.
export type ResolveIqcFormValue = {
  iqcId: string
  disposition: IqcDisposition | ""
}

export function buildResolveIqcFormDefaultValues(
  iqcId: string
): ResolveIqcFormValue {
  return { iqcId, disposition: "" }
}
