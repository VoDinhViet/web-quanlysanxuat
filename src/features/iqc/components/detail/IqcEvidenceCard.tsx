import { AttachmentsField } from "@/components/shared/AttachmentsField"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/types/file.type"
import type { UploadType } from "@/lib/types/file.type"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

type IqcEvidenceCardProps = {
  form: IqcDetailFormApi
  // Both attachment fields carry the same `FileFieldValue[]` type, so a single component covers
  // §4 (qcEvidence) and §6 (dispositionEvidence) — the 2nd use of the same "1 card = 1
  // AttachmentsField" shape, promoted straight to a shared leaf instead of two near-copies.
  name: "qcEvidence" | "dispositionEvidence"
  title: string
  description: string
  icon: ComponentType<IconProps>
  hint: string
  uploadType: UploadType
  disabled?: boolean
}

export function IqcEvidenceCard({
  form,
  name,
  title,
  description,
  icon,
  hint,
  uploadType,
  disabled,
}: IqcEvidenceCardProps) {
  return (
    <IqcDetailSectionCard icon={icon} title={title} description={description}>
      <form.Field name={name}>
        {(field) => (
          <AttachmentsField
            label="Tệp đính kèm"
            hint={hint}
            formatHint="Hỗ trợ: JPG, PNG, PDF, DOCX, XLSX (tối đa 10MB)"
            invalidTypeMessage="Chỉ chấp nhận ảnh hoặc PDF/DOCX/XLSX."
            uploadType={uploadType}
            accept={ACCEPTED_EVIDENCE_TYPES}
            maxSize={MAX_DOCUMENT_SIZE_BYTES}
            layout="grid"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={disabled}
          />
        )}
      </form.Field>
    </IqcDetailSectionCard>
  )
}
