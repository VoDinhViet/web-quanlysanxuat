import { Surface } from "@/components/shared/layout/Surface"
import { OqcAqlInputCard } from "@/features/oqc/components/detail/OqcAqlInputCard"
import { OqcDetailHeader } from "@/features/oqc/components/detail/OqcDetailHeader"
import { OqcResultCard } from "@/features/oqc/components/detail/OqcResultCard"
import { useOqcDetailForm } from "@/features/oqc/hooks/use-oqc-detail-form"
import { OqcStatus } from "@/lib/types/oqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"

type OqcDetailFormProps = {
  oqc: OqcDetail
}

// One <form> for the whole detail page — "Lưu" (OqcDetailActions, inside OqcDetailHeader) is a
// plain `type="submit"` button. Locked (`isLocked`) once `status` reaches COMPLETED — mirrors
// IqcDetailForm.tsx, but the lock here is permanent (no un-complete route on the backend, unlike
// IQC's WAITING_RETURN → COMPLETED path).
export function OqcDetailForm({ oqc }: OqcDetailFormProps) {
  const { form, mutation } = useOqcDetailForm(oqc)
  const isLocked = oqc.status === OqcStatus.COMPLETED
  const disabled = isLocked || mutation.isPending

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      <Surface>
        <OqcDetailHeader form={form} oqc={oqc} isPending={mutation.isPending} />
      </Surface>

      <OqcAqlInputCard form={form} oqc={oqc} disabled={disabled} />
      <OqcResultCard form={form} disabled={disabled} />
    </form>
  )
}
