import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ErrorCode, useDropzone } from "react-dropzone"
import { Loader2, Paperclip } from "lucide-react"

import { AttachmentsFieldList } from "@/components/shared/inputs/AttachmentsFieldList"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { UploadType } from "@/lib/types/file.type"
import type { FileRejection } from "react-dropzone"

function resolveDropRejectionMessage(
  rejections: FileRejection[],
  invalidTypeMessage: string
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return invalidTypeMessage
    case ErrorCode.FileTooLarge:
      return "Kích thước file vượt quá giới hạn cho phép."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

type AttachmentsFieldProps = {
  label: string
  hint: string
  formatHint: string
  invalidTypeMessage: string
  uploadType: UploadType
  accept: Record<string, string[]>
  maxSize: number
  value: FileFieldValue[]
  onChange: (value: FileFieldValue[]) => void
  disabled?: boolean
  // "grid" = horizontal dropzone + 2-col list (OrderAttachmentsField's old shape); "list" =
  // stacked dropzone + 1-col list (SupplierAttachmentsField's old shape).
  layout?: "grid" | "list"
}

// Promoted from OrderAttachmentsField/SupplierAttachmentsField, which were already near-identical
// copies — the IQC detail page needs two more (bằng chứng QC + bằng chứng quyết định), the 3rd/4th
// use crossing the repo's "no abstraction until 3rd use" threshold.
export function AttachmentsField({
  label,
  hint,
  formatHint,
  invalidTypeMessage,
  uploadType,
  accept,
  maxSize,
  value,
  onChange,
  disabled,
  layout = "list",
}: AttachmentsFieldProps) {
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
    accept,
    maxSize,
    multiple: true,
    disabled,
    onDropAccepted: async (files) => {
      setClientError(null)
      // allSettled so one failed file doesn't discard the ones that made it —
      // react-dropzone doesn't await this callback, so a rejection here would
      // also surface as an unhandled promise error.
      const results = await Promise.allSettled(
        files.map((file) => upload(file))
      )
      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded])
      }

      const failedCount = results.length - uploaded.length
      if (failedCount > 0) {
        setClientError(
          `${failedCount} file tải lên thất bại. Vui lòng thử lại.`
        )
      }
    },
    onDropRejected: (rejections) =>
      setClientError(
        resolveDropRejectionMessage(rejections, invalidTypeMessage)
      ),
  })

  // Keyed and removed by `id`, not `url`: the URL now carries a per-response
  // signature, so the same file renders as two different strings across reads.
  const removeAttachment = (id: string) => {
    onChange(value.filter((attachment) => attachment.id !== id))
  }

  const errorMessage = clientError ?? error?.message ?? null

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-sm font-semibold text-foreground">
          {label}
          {value.length > 0 ? (
            <span className="ml-1 font-normal text-muted-foreground">
              · {value.length} tệp
            </span>
          ) : null}
        </span>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": `Tải ${label.toLowerCase()} lên`,
          className: cn(
            "relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex w-full items-center gap-4 rounded-lg border-2 border-dashed border-input bg-muted/40 px-4 py-4 transition-colors",
            layout === "grid"
              ? "min-h-24"
              : "min-h-28 flex-col justify-center gap-1.5 text-center",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          {layout === "grid" ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Paperclip className="size-5" />
            </div>
          ) : (
            <Paperclip className="size-5 text-muted-foreground/60" />
          )}
          <div className={cn("min-w-0", layout === "grid" && "space-y-0.5")}>
            <p className="text-xs text-muted-foreground">
              Kéo thả file vào đây hoặc{" "}
              <span className="font-medium text-primary">chọn file</span>
            </p>
            <p className="text-[11px] text-muted-foreground">{formatHint}</p>
          </div>

          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}

      <AttachmentsFieldList
        value={value}
        onRemove={removeAttachment}
        disabled={disabled}
        layout={layout}
      />
    </div>
  )
}
