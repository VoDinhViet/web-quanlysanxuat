import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { Loader2, Paperclip } from "lucide-react"

import {
  QcEvidenceThumbnail,
  resolveDropRejectionMessage,
} from "@/components/shared/composites/QcEvidenceThumbnail"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  UploadType,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"

type SupplierReturnEvidenceFieldProps = {
  value: FileFieldValue[]
  onChange: (
    value: FileFieldValue[] | ((prev: FileFieldValue[]) => FileFieldValue[])
  ) => void
  disabled?: boolean
}

// "File đính kèm (nếu có)" của dialog "Xác nhận xuất trả" — cùng khuôn
// JobOperationReportEvidenceField.tsx, nhận cả ảnh lẫn tài liệu (ACCEPTED_EVIDENCE_TYPES, khớp
// backend's FileKind.EVIDENCE cho UploadType.SUPPLIER_RETURN_EVIDENCE) thay vì chỉ ảnh — "xuất
// trả" gần với bàn giao chứng từ vật lý (biên bản, phiếu giao nhận) hơn ảnh báo cáo xưởng.
export function SupplierReturnEvidenceField({
  value,
  onChange,
  disabled,
}: SupplierReturnEvidenceFieldProps) {
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
      formData.append("type", UploadType.SUPPLIER_RETURN_EVIDENCE)
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
        onChange((prev) => [...prev, ...uploaded])
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
    <div className="space-y-3">
      <span className="block text-xs font-medium text-foreground">
        File đính kèm (nếu có)
      </span>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải file lên",
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
            <p className="text-[11px] text-muted-foreground">
              Hỗ trợ: JPG, PNG, WEBP, GIF, PDF, DOCX, XLSX (tối đa 10MB)
            </p>
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

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {value.map((file) => (
            <QcEvidenceThumbnail
              key={file.id}
              file={file}
              disabled={disabled}
              onRemove={(id) =>
                onChange((prev) => prev.filter((item) => item.id !== id))
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}
