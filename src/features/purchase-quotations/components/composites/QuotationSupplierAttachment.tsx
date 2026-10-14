import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { Loader2, Paperclip } from "lucide-react"
import { useDropzone } from "react-dropzone"

import {
  QcEvidenceThumbnail,
  resolveDropRejectionMessage,
} from "@/components/shared/composites/QcEvidenceThumbnail"
import { usePasteToDropzone } from "@/hooks/use-paste-to-dropzone"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  UploadType,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"

type QuotationSupplierAttachmentProps = {
  value?: FileFieldValue[]
  disabled?: boolean
  onChange?: (value: FileFieldValue[]) => void
}

export function QuotationSupplierAttachment({
  value = [],
  disabled = false,
  onChange,
}: QuotationSupplierAttachmentProps) {
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
      formData.append("type", UploadType.QUOTATION_SUPPLIER_EVIDENCE)
      return uploadFileFn({ data: formData })
    },
  })

  const { getRootProps, getInputProps, isDragActive, rootRef, inputRef } =
    useDropzone({
      accept: ACCEPTED_EVIDENCE_TYPES,
      maxSize: MAX_DOCUMENT_SIZE_BYTES,
      multiple: true,
      disabled: disabled || !onChange,
      onDropAccepted: async (acceptedFiles) => {
        setClientError(null)
        const results = await Promise.allSettled(
          acceptedFiles.map((file) => upload(file))
        )
        const uploaded = results
          .filter(
            (r): r is PromiseFulfilledResult<FileFieldValue> =>
              r.status === "fulfilled"
          )
          .map((r) => r.value)

        if (uploaded.length > 0 && onChange) {
          onChange([...value, ...uploaded])
        }

        const failedCount = results.length - uploaded.length
        if (failedCount > 0) {
          setClientError(
            `${failedCount} tệp tải lên thất bại. Vui lòng thử lại.`
          )
        }
      },
      onDropRejected: (rejections) =>
        setClientError(resolveDropRejectionMessage(rejections)),
    })

  usePasteToDropzone({ rootRef, inputRef, disabled: disabled || !onChange })

  const errorMessage = clientError ?? error?.message
  const fileCount = value.length

  return (
    <div className="space-y-2">
      {!disabled && onChange && (
        <div
          {...getRootProps({
            role: "button",
            "aria-label": "Tải tệp báo giá",
            className: cn(
              "relative flex flex-col items-center justify-center rounded-md border border-dashed border-input bg-muted/20 px-3 py-2.5 text-center transition-colors hover:border-primary/60 hover:bg-muted/40 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isDragActive && "border-primary bg-primary/5",
              disabled && "pointer-events-none opacity-50"
            ),
          })}
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Paperclip className="size-3.5 text-primary" />
            <span>
              Kéo thả hoặc{" "}
              <span className="font-medium text-primary">chọn tệp</span>
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
            PDF, Ảnh, Excel, Word (tối đa 10MB)
          </p>

          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="ml-1.5 text-xs text-muted-foreground">
                Đang tải...
              </span>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}

      {fileCount > 0 && (
        <ul className="max-h-32 divide-y divide-border/40 overflow-y-auto rounded-md border border-border/50 bg-background text-xs">
          {value.map((file) => (
            <QcEvidenceThumbnail
              key={file.id}
              file={file}
              disabled={disabled || !onChange}
              onRemove={(id) => {
                if (onChange) {
                  onChange(value.filter((item) => item.id !== id))
                }
              }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
