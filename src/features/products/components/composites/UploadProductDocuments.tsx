import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import prettyBytes from "pretty-bytes"
import { ErrorCode, useDropzone } from "react-dropzone"
import { AlertCircle, ExternalLink, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getDocumentTypeInfo } from "@/features/products/utils/document-type"
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
  // `.at()` chứ không phải `[0]`: tsconfig không bật `noUncheckedIndexedAccess`, index truy cập
  // thẳng sẽ bị TS coi là luôn có giá trị dù mảng rỗng.
  const firstError = rejections.at(0)?.errors.at(0)
  switch (firstError?.code) {
    case ErrorCode.FileInvalidType:
      return "Định dạng tệp không được hỗ trợ."
    case ErrorCode.FileTooLarge:
      return "Kích thước tệp vượt quá 10MB."
    case ErrorCode.TooManyFiles:
      return "Số lượng tệp vượt giới hạn."
    default:
      return rejections.length > 0
        ? firstError?.message || "Không thể tải tệp lên."
        : null
  }
}

export type UploadProductDocumentsProps = {
  value: FileFieldValue[]
  onChange: (
    value: FileFieldValue[] | ((prev: FileFieldValue[]) => FileFieldValue[])
  ) => void
  disabled?: boolean
  className?: string
}

export function UploadProductDocuments({
  value = [],
  onChange,
  disabled,
  className,
}: UploadProductDocumentsProps) {
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
      formData.append("type", UploadType.ITEM_DOCUMENT)
      return uploadFileFn({ data: formData })
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
    multiple: true,
    disabled: disabled || isPending,
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
        setClientError(`${failedCount} tệp tải lên thất bại. Vui lòng thử lại.`)
      }
    },
    onDropRejected: (rejections) =>
      setClientError(resolveDropRejectionMessage(rejections)),
  })

  const removeFile = (id: string) => {
    onChange((prev) => prev.filter((file) => file.id !== id))
  }

  const clearAllFiles = () => {
    onChange([])
  }

  const errorMessage = clientError ?? error?.message
  const totalBytes = value.reduce((sum, file) => sum + (file.size || 0), 0)

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Header tối giản */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-foreground">
            Tài liệu đính kèm
          </label>
          {value.length > 0 && (
            <span className="font-mono text-[11px] text-muted-foreground">
              ({value.length})
            </span>
          )}
        </div>

        {value.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              {prettyBytes(totalBytes)}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={clearAllFiles}
                className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dropzone tối giản phong cách Linear / Vercel */}
      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải tài liệu đính kèm lên",
          className: cn(
            "group relative flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-4 text-center transition-all duration-150 outline-none hover:border-foreground/25 hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring",
            isDragActive && "scale-[0.995] border-foreground/40 bg-muted/50",
            (disabled || isPending) && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground shadow-2xs transition-colors group-hover:text-foreground">
          <Upload className="size-3.5" strokeWidth={1.75} />
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Kéo thả tài liệu vào đây hoặc{" "}
            <span className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground">
              chọn tệp
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            CAD, PDF, Word, Excel, ZIP (tối đa 10MB)
          </p>
        </div>

        {isPending && (
          <div className="backdrop-blur-2xs absolute inset-0 flex items-center justify-center rounded-xl bg-background/80">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-foreground" />
              <span>Đang tải lên...</span>
            </div>
          </div>
        )}
      </div>

      {/* Lỗi nếu có */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setClientError(null)}
            className="text-destructive/60 hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Danh sách file tối giản, sắc nét */}
      {value.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {value.map((file) => {
            const docInfo = getDocumentTypeInfo(
              file.mimetype,
              file.originalName
            )
            const DocIcon = docInfo.icon

            return (
              <li
                key={file.id}
                className="group relative flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 transition-all hover:border-border hover:bg-muted/20"
              >
                {/* Thông tin tệp */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground">
                    <DocIcon className="size-3.5" strokeWidth={1.75} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <a
                      href={resolveFileUrl(file.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={file.originalName}
                      className="block truncate text-xs font-medium text-foreground hover:underline"
                    >
                      {file.originalName}
                    </a>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-mono uppercase">
                        {docInfo.label}
                      </span>
                      <span>·</span>
                      <span className="font-mono">
                        {prettyBytes(file.size)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nút thao tác tinh gọn */}
                <div className="flex shrink-0 items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <a
                          href={resolveFileUrl(file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-6 items-center justify-center rounded text-muted-foreground/60 opacity-60 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground hover:opacity-100"
                          aria-label={`Mở xem ${file.originalName}`}
                        >
                          <ExternalLink className="size-3" strokeWidth={1.75} />
                        </a>
                      }
                    />
                    <TooltipContent>Mở tệp</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          disabled={disabled}
                          aria-label={`Xóa ${file.originalName}`}
                          onClick={() => removeFile(file.id)}
                          className="size-6 text-muted-foreground/60 transition-all hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="size-3" strokeWidth={2} />
                        </Button>
                      }
                    />
                    <TooltipContent>Xóa tệp</TooltipContent>
                  </Tooltip>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
