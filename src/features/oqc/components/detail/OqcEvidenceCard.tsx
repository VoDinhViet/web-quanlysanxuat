import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { Documents } from "@solar-icons/react"
import { Loader2, Paperclip } from "lucide-react"

import {
  QcEvidenceThumbnail,
  resolveDropRejectionMessage,
} from "@/components/shared/composites/QcEvidenceThumbnail"
import { OqcDetailSectionCard } from "@/features/oqc/components/detail/OqcDetailSectionCard"
import {
  confirmOqcFormDefaultValues,
  confirmOqcSchema,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import { withForm } from "@/hooks/use-app-form"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  UploadType,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"

// Bằng chứng kiểm tra/quyết định xử lý OQC — component riêng của feature oqc, không dùng chung
// với orders/suppliers/iqc (mỗi feature một cách upload/hiển thị riêng, tránh đụng logic nhau
// khi một bên đổi). `name`/`title`/`description`/`icon`/`hint`/`uploadType` dưới đây chỉ là
// placeholder default cho kiểu suy của `withForm` — mọi lần dùng thật trong OqcDetailForm.tsx đều
// ghi đè hết.
export const OqcEvidenceCard = withForm({
  defaultValues: confirmOqcFormDefaultValues,
  validators: { onSubmit: confirmOqcSchema },
  props: {
    name: "qcEvidence" as "qcEvidence" | "dispositionEvidence",
    title: "",
    description: "",
    icon: Documents,
    hint: "",
    uploadType: UploadType.OQC_EVIDENCE,
    disabled: false,
  },
  render: function Render({
    form,
    name,
    title,
    description,
    icon: Icon,
    hint,
    uploadType,
    disabled,
  }) {
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
      <OqcDetailSectionCard icon={Icon} title={title} description={description}>
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
                      <span className="font-medium text-primary">
                        chọn file
                      </span>
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
      </OqcDetailSectionCard>
    )
  },
})
