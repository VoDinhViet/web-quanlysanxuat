import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { Loader2, Paperclip } from "lucide-react"

import {
  QcEvidenceThumbnail,
  resolveDropRejectionMessage,
} from "@/components/shared/inputs/QcEvidenceThumbnail"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/types/file.type"
import type { UploadType } from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

type IqcEvidenceCardProps = {
  form: IqcDetailFormApi
  // Cả 2 field bằng chứng IQC cùng shape FileFieldValue[], nên dùng chung 1 component tham số
  // hoá theo name/title/description/icon/hint/uploadType — vẫn trong feature iqc, không phải
  // chia sẻ chéo feature.
  name: "qcEvidence" | "dispositionEvidence"
  title: string
  description: string
  icon: ComponentType<IconProps>
  hint: string
  uploadType: UploadType
  disabled?: boolean
}

// Bằng chứng kiểm tra/quyết định xử lý IQC — component riêng của feature iqc, không dùng chung
// với orders/suppliers/oqc (mỗi feature một cách upload/hiển thị riêng, tránh đụng logic nhau
// khi một bên đổi).
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
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadFileFn = useServerFn(uploadFile)

  const {
    mutateAsync: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", uploadType)
      return uploadFileFn({ data: formData })
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_EVIDENCE_TYPES,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
    multiple: true,
    disabled,
    onDropAccepted: async (files) => {
      setClientError(null)
      const results = await Promise.allSettled(
        files.map((file) => upload(file))
      )
      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)

      if (uploaded.length > 0) {
        form.setFieldValue(name, (prev) => [...prev, ...uploaded])
      }

      const failedCount = results.length - uploaded.length
      if (failedCount > 0) {
        setClientError(
          `${failedCount} file tải lên thất bại. Vui lòng thử lại.`
        )
      }
    },
    onDropRejected: (rejections) =>
      setClientError(resolveDropRejectionMessage(rejections)),
  })

  const errorMessage = clientError ?? error?.message

  return (
    <IqcDetailSectionCard icon={icon} title={title} description={description}>
      <form.Field name={name}>
        {(field) => (
          <div className="space-y-3">
            <div
              {...getRootProps({
                role: "button",
                "aria-label": "Tải tệp đính kèm lên",
                className: cn(
                  "relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  disabled && "pointer-events-none opacity-50"
                ),
              })}
            >
              <input {...getInputProps()} />

              <div
                className={cn(
                  "flex min-h-24 w-full items-center gap-4 rounded-lg border-2 border-dashed border-input bg-muted/40 px-4 py-4 transition-colors",
                  isDragActive && "border-primary bg-primary/5"
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Paperclip className="size-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Kéo thả file vào đây hoặc{" "}
                    <span className="font-medium text-primary">chọn file</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{hint}</p>
                </div>

                {isPending && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}

            {field.state.value.length > 0 && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {field.state.value.map((file) => (
                  <QcEvidenceThumbnail
                    key={file.id}
                    file={file}
                    disabled={disabled}
                    onRemove={(id) =>
                      field.handleChange(
                        field.state.value.filter((item) => item.id !== id)
                      )
                    }
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </form.Field>
    </IqcDetailSectionCard>
  )
}
