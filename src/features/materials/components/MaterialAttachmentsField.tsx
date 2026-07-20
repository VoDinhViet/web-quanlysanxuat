import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ErrorCode, useDropzone } from "react-dropzone"
import { FileText, Loader2, Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { resolveFileUrl } from "@/lib/file-url"
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { FileRejection } from "react-dropzone"

function resolveDropRejectionMessage(
  rejections: FileRejection[]
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return "Chỉ chấp nhận PDF, DOCX, XLSX."
    case ErrorCode.FileTooLarge:
      return "Kích thước file tối đa 10MB."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

type MaterialAttachmentsFieldProps = {
  value: FileFieldValue[]
  onChange: (value: FileFieldValue[]) => void
  disabled?: boolean
}

export function MaterialAttachmentsField({
  value,
  onChange,
  disabled,
}: MaterialAttachmentsFieldProps) {
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
      formData.append("type", "MATERIAL_DOCUMENT")
      return uploadFileFn({ data: formData })
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
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
        onChange([
          ...value,
          ...uploaded.map((doc) => ({
            id: doc.id,
            url: doc.url,
            originalName: doc.originalName,
          })),
        ])
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

  // Keyed and removed by `id`, not `url`: the URL now carries a per-response
  // signature, so the same file renders as two different strings across reads.
  const removeAttachment = (id: string) => {
    onChange(value.filter((attachment) => attachment.id !== id))
  }

  const errorMessage = clientError ?? error?.message ?? null

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-foreground">
        Tài liệu đính kèm
      </span>
      <p className="text-[11px] text-muted-foreground">
        Bản vẽ, catalogue, tiêu chuẩn kỹ thuật...
      </p>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải tài liệu đính kèm lên",
          className: cn(
            "relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-input bg-muted/40 p-4 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <Paperclip className="size-5 text-muted-foreground/60" />
          <p className="text-[11px] text-muted-foreground">
            Kéo thả file vào đây hoặc{" "}
            <span className="font-medium text-primary">chọn file</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Hỗ trợ: PDF, DOCX, XLSX (tối đa 10MB)
          </p>

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

      {value.length > 0 ? (
        <ul className="space-y-1.5">
          {value.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <a
                href={resolveFileUrl(attachment.url)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-xs text-foreground hover:text-primary hover:underline"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{attachment.originalName}</span>
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={`Xóa ${attachment.originalName}`}
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
