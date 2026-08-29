import { useField } from "@tanstack/react-form"
import { ClipboardList, Documents } from "@solar-icons/react"

import { Surface } from "@/components/shared/layouts/Surface"
import { IqcAqlInputCard } from "@/features/iqc/components/detail/IqcAqlInputCard"
import { IqcDetailHeader } from "@/features/iqc/components/detail/IqcDetailHeader"
import { IqcDispositionCard } from "@/features/iqc/components/detail/IqcDispositionCard"
import { IqcEvidenceCard } from "@/features/iqc/components/detail/IqcEvidenceCard"
import { IqcGeneralInfoCard } from "@/features/iqc/components/detail/IqcGeneralInfoCard"
import { IqcProcessFlowCard } from "@/features/iqc/components/detail/IqcProcessFlowCard"
import { IqcResultCard } from "@/features/iqc/components/detail/IqcResultCard"
import { IqcRulesCard } from "@/features/iqc/components/detail/IqcRulesCard"
import { IqcStatusLegend } from "@/features/iqc/components/detail/IqcStatusLegend"
import { useIqcDetailForm } from "@/features/iqc/hooks/use-iqc-detail-form"
import { UploadType } from "@/lib/types/file.type"
import { IqcResult, IqcStatus } from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"

type IqcDetailFormProps = {
  iqc: IqcDetail
}

// One <form> for the whole detail page — "Lưu" (IqcDetailActions, inside IqcDetailHeader) is a
// plain `type="submit"` button, no separate per-card mutations like the old confirm/resolve
// flows had. `result` is read live here (one subscription) to gate both §5 QUYẾT ĐỊNH XỬ LÝ and
// its evidence card — hidden until the user picks FAIL, matching IqcResultCard's own radio
// cards. Locked (`isLocked`) once `status` reaches WAITING_RETURN — every field disables, and
// IqcDetailActions hides the Lưu button entirely (see confirm's E159).
export function IqcDetailForm({ iqc }: IqcDetailFormProps) {
  const { form, mutation } = useIqcDetailForm(iqc)
  const result = useField({ form, name: "result" }).state.value
  const isLocked = iqc.status === IqcStatus.WAITING_RETURN
  const disabled = isLocked || mutation.isPending

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
        <IqcDetailHeader form={form} iqc={iqc} isPending={mutation.isPending} />
      </Surface>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <IqcGeneralInfoCard form={form} iqc={iqc} disabled={disabled} />
          <IqcAqlInputCard form={form} iqc={iqc} disabled={disabled} />
          <IqcResultCard form={form} disabled={disabled} />
          <IqcEvidenceCard
            form={form}
            name="qcEvidence"
            title="Bằng chứng kiểm tra"
            description="Ảnh chụp thực tế và phiếu đo lường khi kiểm tra"
            icon={Documents}
            hint="Ảnh chụp thực tế, phiếu đo lường..."
            uploadType={UploadType.IQC_EVIDENCE}
            disabled={disabled}
          />

          {result === IqcResult.FAIL && (
            <>
              <IqcDispositionCard form={form} iqc={iqc} disabled={disabled} />
              <IqcEvidenceCard
                form={form}
                name="dispositionEvidence"
                title="Bằng chứng quyết định xử lý"
                description="Biên bản xử lý, ảnh phân loại lô hàng"
                icon={ClipboardList}
                hint="Biên bản xử lý, ảnh phân loại..."
                uploadType={UploadType.IQC_DISPOSITION_EVIDENCE}
                disabled={disabled}
              />
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <IqcProcessFlowCard />
          <IqcStatusLegend
            current={iqc.status}
            supplierReturn={iqc.supplierReturn}
          />
          <IqcRulesCard />
        </div>
      </div>
    </form>
  )
}
