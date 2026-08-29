import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import prettyBytes from "pretty-bytes"
import { ErrorCode, useDropzone } from "react-dropzone"
import {
  FileSpreadsheet,
  FileText,
  FileType,
  Loader2,
  Paperclip,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { resolveFileUrl } from "@/lib/file-url"
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  UploadType,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { ComponentType } from "react"
import type { FileRejection } from "react-dropzone"

type DocBadge = {
  icon: ComponentType<{ className?: string }>
  className: string
}

// Categorical color per doc type — an order document is always PDF/DOCX/XLSX
// (ACCEPTED_DOCUMENT_TYPES), never an image, so unlike QC evidence there's no image-preview
// branch here at all.
function resolveDocBadge(mimetype: string): DocBadge {
  if (mimetype === "application/pdf") {
    return {
      icon: FileText,
      className: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    }
  }
  if (mimetype.includes("wordprocessingml")) {
    return {
      icon: FileType,
      className:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    }
  }
  return {
    icon: FileSpreadsheet,
    className:
      "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  }
}

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

type OrderDocumentsFieldProps = {
  value: FileFieldValue[]
  // Chấp nhận cả updater function (không chỉ giá trị) — bắt buộc để tránh race khi thả nhiều
  // file liên tiếp (xem onDropAccepted bên dưới): `field.handleChange` của TanStack Form vốn đã
  // hỗ trợ dạng này (`Updater<TData>`).
  onChange: (
    value: FileFieldValue[] | ((prev: FileFieldValue[]) => FileFieldValue[])
  ) => void
  disabled?: boolean
}

// Tài liệu đính kèm đơn hàng (hợp đồng, bản vẽ, chứng từ) — component riêng của feature orders,
// không dùng chung với suppliers/iqc/oqc (mỗi feature một cách upload/hiển thị riêng, tránh đụng
// logic nhau khi một bên đổi).
export function OrderDocumentsField({
  value,
  onChange,
  disabled,
}: OrderDocumentsFieldProps) {
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
      formData.append("type", UploadType.ORDER_DOCUMENT)
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
      // allSettled so one failed file doesn't discard the ones that made it — react-dropzone
      // doesn't await this callback, so a rejection here would also surface as an unhandled
      // promise error.
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
          Hợp đồng, bản vẽ, chứng từ liên quan tới đơn hàng...
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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((file) => {
            const docBadge = resolveDocBadge(file.mimetype)

            return (
              <li
                key={file.id}
                className="relative overflow-hidden rounded-lg border border-border bg-card"
              >
                <a
                  href={resolveFileUrl(file.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:opacity-90"
                >
                  <div
                    className={cn(
                      "flex aspect-square w-full items-center justify-center",
                      docBadge.className
                    )}
                  >
                    <docBadge.icon className="size-8" />
                  </div>

                  <div className="space-y-0.5 px-2.5 py-2">
                    <p className="truncate text-xs font-medium text-foreground">
                      {file.originalName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {prettyBytes(file.size)}
                    </p>
                  </div>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  disabled={disabled}
                  aria-label={`Xóa ${file.originalName}`}
                  onClick={() => removeFile(file.id)}
                  className="absolute top-1.5 right-1.5 rounded-full border-border/60 bg-background/90 shadow-sm hover:border-destructive/40 hover:text-destructive"
                >
                  <X className="size-3.5" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
