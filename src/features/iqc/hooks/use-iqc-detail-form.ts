import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { confirmIqc } from "@/features/iqc/api/server-functions/confirm-iqc.api"
import {
  buildConfirmIqcFormDefaultValues,
  confirmIqcSchema,
} from "@/features/iqc/schemas/confirm-iqc.schema"
import type { ConfirmIqcFormValue } from "@/features/iqc/schemas/confirm-iqc.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type {
  IqcInspectionLevel,
  IqcResult,
  IqcDetail,
} from "@/lib/types/iqc.type"
import type { z } from "zod"

// Owns the single form + mutation backing the whole detail page's one "Lưu" button —
// IqcDetailForm wraps every section card in this same <form>, so mutation/error state lives
// here instead of being split across per-card useMutation calls the way the old separate
// confirm/resolve forms were.
export function useIqcDetailForm(iqc: IqcDetail) {
  const queryClient = useQueryClient()
  const confirmIqcFn = useServerFn(confirmIqc)

  const mutation = useMutation({
    mutationFn: (value: z.input<typeof confirmIqcSchema>) =>
      confirmIqcFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["iqc"] })
      toast.success("Đã lưu kết quả QC")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: buildConfirmIqcFormDefaultValues(iqc),
    validators: {
      onSubmit: confirmIqcSchema,
    },
    onSubmit: ({ value }: { value: ConfirmIqcFormValue }) =>
      mutation.mutate({
        ...value,
        // `validators.onSubmit` (confirmIqcSchema) has already guaranteed non-blank
        // inspectionLevel/result by the time this runs — TS just can't narrow them from the
        // form's own (deliberately looser, blank-until-picked) value type.
        inspectionLevel: value.inspectionLevel as IqcInspectionLevel,
        result: value.result as IqcResult,
      }),
  })

  return { form, mutation }
}

// The concrete AppField-extended form type this hook's one real useAppForm call produces —
// every section-card component below imports this instead of accepting `form: AnyFormApi`, so
// `form.AppField`/`form.Field`/`form.Subscribe` stay fully typed without going through
// withForm's props-templating (which would need an unsafe placeholder default for the `iqc`
// prop those cards also take — see IqcGeneralInfoCard.tsx and friends).
export type IqcDetailFormApi = ReturnType<typeof useIqcDetailForm>["form"]
