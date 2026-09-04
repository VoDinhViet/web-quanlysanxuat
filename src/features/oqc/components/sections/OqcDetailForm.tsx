import { revalidateLogic, useField } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClipboardList, Documents } from "@solar-icons/react"
import { toast } from "sonner"

import { Surface } from "@/components/shared/layouts/Surface"
import { confirmOqc } from "@/features/oqc/api/server-functions/confirm-oqc.api"
import { OqcActivityLogCard } from "@/features/oqc/components/composites/OqcActivityLogCard"
import { OqcAqlInputCard } from "@/features/oqc/components/composites/OqcAqlInputCard"
import { OqcDetailHeader } from "@/features/oqc/components/layouts/OqcDetailHeader"
import { OqcDispositionCard } from "@/features/oqc/components/composites/OqcDispositionCard"
import { OqcEvidenceCard } from "@/features/oqc/components/composites/OqcEvidenceCard"
import { OqcLotSummaryCard } from "@/features/oqc/components/composites/OqcLotSummaryCard"
import { OqcResultCard } from "@/features/oqc/components/composites/OqcResultCard"
import { OqcStatusProgressCard } from "@/features/oqc/components/composites/OqcStatusProgressCard"
import {
  confirmOqcSchema,
  getOqcDefaultValues,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import type {
  ConfirmOqcFormValue,
  ConfirmOqcSchema,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { UploadType } from "@/lib/types/file.type"
import { IqcResult } from "@/lib/types/iqc.type"
import type { IqcInspectionLevel } from "@/lib/types/iqc.type"
import { OqcStatus } from "@/lib/types/oqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"

type OqcDetailFormProps = {
  oqc: OqcDetail
}

// Owns the single form + mutation backing the whole detail page's one "Lưu" button — inlined
// here (not a separate hooks/use-oqc-detail-form.ts) since OqcDetailForm is its only caller.
// Still a real hook (calls useMutation/useAppForm) so it must run unconditionally like any other
// hook — kept as its own function (not flattened into OqcDetailForm's body) so `OqcDetailFormApi`
// below can stay `ReturnType<typeof useOqcDetailForm>["form"]` instead of hand-writing
// useAppForm's generic params (see IqcDetailFormApi in use-iqc-detail-form.ts for the same
// trick).
function useOqcDetailForm(oqc: OqcDetail) {
  const queryClient = useQueryClient()
  const confirmOqcFn = useServerFn(confirmOqc)

  const mutation = useMutation({
    mutationFn: (value: ConfirmOqcSchema) => confirmOqcFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["oqc"] })
      toast.success("Đã lưu kết quả QC")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getOqcDefaultValues(oqc),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: confirmOqcSchema,
    },
    onSubmit: ({ value }: { value: ConfirmOqcFormValue }) =>
      mutation.mutate({
        ...value,
        // `validators.onDynamic` (confirmOqcSchema) has already guaranteed non-blank
        // inspectionLevel/result by the time this runs — TS just can't narrow them from the
        // form's own (deliberately looser, blank-until-picked) value type.
        inspectionLevel: value.inspectionLevel as IqcInspectionLevel,
        result: value.result as IqcResult,
      }),
  })

  return { form, mutation }
}

// The concrete AppField-extended form type this file's one real useAppForm call produces —
// every section-card component below imports this instead of accepting `form: AnyFormApi`.
export type OqcDetailFormApi = ReturnType<typeof useOqcDetailForm>["form"]

// One <form> for the whole detail page — "Lưu" (OqcDetailActions, inside OqcDetailHeader) is a
// plain `type="submit"` button. Locked (`isLocked`) once `status` reaches COMPLETED — mirrors
// IqcDetailForm.tsx, but the lock here is permanent (no un-complete route on the backend, unlike
// IQC's WAITING_RETURN → COMPLETED path). Body is a 2-column grid: left column is the QC input
// flow (lô → AQL → kết quả → xử lý), right column is read-only context (tiến trình + nhật ký) —
// same `xl:grid-cols-[minmax(0,1fr)_340px]` shell as IqcDetailForm.tsx.
export function OqcDetailForm({ oqc }: OqcDetailFormProps) {
  const { form, mutation } = useOqcDetailForm(oqc)
  const isLocked = oqc.status === OqcStatus.COMPLETED
  const disabled = isLocked || mutation.isPending
  const result = useField({ form, name: "result" }).state.value

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      <Surface>
        <OqcDetailHeader form={form} oqc={oqc} isPending={mutation.isPending} />
      </Surface>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <OqcLotSummaryCard oqc={oqc} />
          <OqcAqlInputCard form={form} disabled={disabled} />
          <OqcResultCard form={form} disabled={disabled} />
          <OqcEvidenceCard
            form={form}
            name="qcEvidence"
            title="Bằng chứng kiểm tra"
            description="Ảnh chụp thực tế và phiếu đo lường khi kiểm tra"
            icon={Documents}
            hint="Ảnh chụp thực tế, phiếu đo lường..."
            uploadType={UploadType.OQC_EVIDENCE}
            disabled={disabled}
          />

          {result === IqcResult.FAIL && (
            <>
              <OqcDispositionCard form={form} disabled={disabled} />
              <OqcEvidenceCard
                form={form}
                name="dispositionEvidence"
                title="Bằng chứng quyết định xử lý"
                description="Biên bản xử lý, ảnh phân loại lô hàng"
                icon={ClipboardList}
                hint="Biên bản xử lý, ảnh phân loại..."
                uploadType={UploadType.OQC_DISPOSITION_EVIDENCE}
                disabled={disabled}
              />
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <OqcStatusProgressCard current={oqc.status} />
          <OqcActivityLogCard oqc={oqc} />
        </div>
      </div>
    </form>
  )
}
