import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { confirmOqc } from "@/features/oqc/api/server-functions/confirm-oqc.api"
import {
  buildConfirmOqcFormDefaultValues,
  confirmOqcSchema,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import type { ConfirmOqcFormValue } from "@/features/oqc/schemas/confirm-oqc.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { IqcInspectionLevel, IqcResult } from "@/lib/types/iqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"
import type { z } from "zod"

// Owns the single form + mutation backing the whole detail page's one "Lưu" button — mirrors
// use-iqc-detail-form.ts, thu gọn (không có disposition/attachments).
export function useOqcDetailForm(oqc: OqcDetail) {
  const queryClient = useQueryClient()
  const confirmOqcFn = useServerFn(confirmOqc)

  const mutation = useMutation({
    mutationFn: (value: z.input<typeof confirmOqcSchema>) =>
      confirmOqcFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["oqc"] })
      toast.success("Đã lưu kết quả QC")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: buildConfirmOqcFormDefaultValues(oqc),
    validators: {
      onSubmit: confirmOqcSchema,
    },
    onSubmit: ({ value }: { value: ConfirmOqcFormValue }) =>
      mutation.mutate({
        ...value,
        // `validators.onSubmit` (confirmOqcSchema) has already guaranteed non-blank
        // inspectionLevel/result by the time this runs — TS just can't narrow them from the
        // form's own (deliberately looser, blank-until-picked) value type.
        inspectionLevel: value.inspectionLevel as IqcInspectionLevel,
        result: value.result as IqcResult,
      }),
  })

  return { form, mutation }
}

// The concrete AppField-extended form type this hook's one real useAppForm call produces — every
// section-card component below imports this instead of accepting `form: AnyFormApi`.
export type OqcDetailFormApi = ReturnType<typeof useOqcDetailForm>["form"]
