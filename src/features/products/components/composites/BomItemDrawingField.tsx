import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ErrorCode, useDropzone } from "react-dropzone"
import { FileText, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { resolveFileUrl } from "@/lib/file-url"
import {
  ACCEPTED_DRAWING_TYPES,
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
      return "Chỉ chấp nhận file PDF."
    case ErrorCode.FileTooLarge:
      return "Kích thước file tối đa 10MB."
    case ErrorCode.TooManyFiles:
      return "Chỉ được chọn 1 file."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

type BomItemDrawingFieldProps = {
  value: FileFieldValue | null
  onChange: (value: FileFieldValue | null) => void
  disabled?: boolean
}

// Single-slot, PDF-only document field for a BOM node's own bản vẽ — the
// missing combination between ProductImageField (single-file, image-only) and
// ProductAttachmentsField (document-typed, multi-file).
export function BomItemDrawingField({
  value,
  onChange,
  disabled,
}: BomItemDrawingFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadFileFn = useServerFn(uploadFile)

  const {
    mutate: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "BOM_ITEM_DRAWING")
      return uploadFileFn({ data: formData })
    },
    onSuccess: (result) => {
      onChange(result)
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_DRAWING_TYPES,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
    multiple: false,
    disabled,
    onDropAccepted: ([file]) => {
      setClientError(null)
      upload(file)
    },
    onDropRejected: (rejections) =>
      setClientError(resolveDropRejectionMessage(rejections)),
  })

  const errorMessage = clientError ?? error?.message ?? null

  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-foreground">Bản vẽ</span>

      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
          <a
            href={resolveFileUrl(value.url)}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 text-xs text-foreground hover:text-primary hover:underline"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{value.originalName}</span>
          </a>
          {!disabled ? (
            <TooltipTrigger>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Xóa bản vẽ"
                onClick={() => {
                  setClientError(null)
                  onChange(null)
                }}
              >
                <X className="size-3.5" />
              </Button>
              <Tooltip>Xóa bản vẽ</Tooltip>
            </TooltipTrigger>
          ) : null}
        </div>
      ) : (
        <div
          {...getRootProps({
            role: "button",
            "aria-label": "Tải bản vẽ lên",
            className: cn(
              "relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "pointer-events-none opacity-50"
            ),
          })}
        >
          <input {...getInputProps()} />

          <div
            className={cn(
              "flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input bg-muted/40 p-3 text-center transition-colors",
              isDragActive && "border-primary bg-primary/5"
            )}
          >
            <p className="text-[11px] text-muted-foreground">
              Kéo thả file PDF vào đây hoặc{" "}
              <span className="font-medium text-primary">chọn file</span>
            </p>

            {isPending ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
