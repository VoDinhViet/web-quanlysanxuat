import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ErrorCode, useDropzone } from "react-dropzone"
import { FileText, Loader2, Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { resolveFileUrl } from "@/lib/file-url"
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  UploadType,
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
      return "Kích thước file vượt quá giới hạn cho phép."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

type SupplierDocumentsFieldProps = {
  value: FileFieldValue[]
  // Chấp nhận cả updater function (không chỉ giá trị) — bắt buộc để tránh race khi thả nhiều
  // file liên tiếp (xem onDropAccepted bên dưới): `field.handleChange` của TanStack Form vốn đã
  // hỗ trợ dạng này (`Updater<TData>`).
  onChange: (
    value: FileFieldValue[] | ((prev: FileFieldValue[]) => FileFieldValue[])
  ) => void
  disabled?: boolean
}

// Tài liệu đính kèm NCC (hợp đồng, báo giá, chứng nhận chất lượng) — component riêng của feature
// suppliers, không dùng chung với orders/iqc/oqc.
export function SupplierDocumentsField({
  value,
  onChange,
  disabled,
}: SupplierDocumentsFieldProps) {
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
      formData.append("type", UploadType.SUPPLIER_DOCUMENT)
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
      const results = await Promise.allSettled(
        files.map((file) => upload(file))
      )
      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)

      if (uploaded.length > 0) {
        // Updater, không phải `[...value, ...uploaded]` đọc `value` đóng gói lúc bắt đầu upload —
        // thả file A rồi thả tiếp file B trước khi A xong sẽ làm callback của B ghi đè mất A nếu
        // dùng snapshot cũ.
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

  const removeFile = (id: string) => {
    onChange((prev) => prev.filter((file) => file.id !== id))
  }

  const errorMessage = clientError ?? error?.message

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-sm font-semibold text-foreground">
          Tài liệu đính kèm
          {value.length > 0 && (
            <span className="ml-1 font-normal text-muted-foreground">
              · {value.length} tệp
            </span>
          )}
        </span>
        <p className="text-[11px] text-muted-foreground">
          Hợp đồng, báo giá, chứng nhận chất lượng...
        </p>
      </div>

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
            "flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-input bg-muted/40 px-4 py-4 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <Paperclip className="size-5 text-muted-foreground/60" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              Kéo thả file vào đây hoặc{" "}
              <span className="font-medium text-primary">chọn file</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Hỗ trợ: PDF, DOCX, XLSX (tối đa 10MB)
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
        <ul className="space-y-1.5">
          {value.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <a
                href={resolveFileUrl(file.url)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-xs text-foreground hover:text-primary hover:underline"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.originalName}</span>
              </a>
              <TooltipTrigger>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  isDisabled={disabled}
                  aria-label={`Xóa ${file.originalName}`}
                  onPress={() => removeFile(file.id)}
                >
                  <X className="size-3.5" />
                </Button>
                <Tooltip>Xóa file</Tooltip>
              </TooltipTrigger>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
