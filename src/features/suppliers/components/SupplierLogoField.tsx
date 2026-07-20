import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ImageUp, Loader2, X } from "lucide-react"
import { ErrorCode, useDropzone } from "react-dropzone"

import { resolveFileUrl } from "@/lib/file-url"
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
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
      return "Chỉ chấp nhận định dạng JPG, PNG, WEBP, GIF."
    case ErrorCode.FileTooLarge:
      return "Kích thước ảnh tối đa 5MB."
    case ErrorCode.TooManyFiles:
      return "Chỉ được chọn 1 ảnh."
    default:
      return rejections.length > 0 ? "Không thể tải ảnh lên." : null
  }
}

type SupplierLogoFieldProps = {
  value: FileFieldValue | null
  onChange: (value: FileFieldValue | null) => void
  disabled?: boolean
}

export function SupplierLogoField({
  value,
  onChange,
  disabled,
}: SupplierLogoFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  // The signed URL expires after about an hour, so a restored draft can show a
  // dead preview. The file id is still valid, so submitting still works.
  const [isPreviewBroken, setIsPreviewBroken] = useState(false)
  const uploadFileFn = useServerFn(uploadFile)

  const {
    mutate: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "SUPPLIER_LOGO")
      return uploadFileFn({ data: formData })
    },
    onSuccess: (result) => {
      setIsPreviewBroken(false)
      onChange({
        id: result.id,
        url: result.url,
        originalName: result.originalName,
      })
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE_BYTES,
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
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="self-start text-xs font-medium text-foreground">
        Logo
      </span>

      <div className="relative w-40">
        <div
          {...getRootProps({
            role: "button",
            "aria-label": "Tải logo lên",
            className: cn(
              "w-40 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "pointer-events-none opacity-50"
            ),
          })}
        >
          <input {...getInputProps()} />

          <div
            className={cn(
              "relative flex aspect-square w-40 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/40 p-3 text-center transition-colors",
              isDragActive && "border-primary bg-primary/5"
            )}
          >
            {value ? (
              <img
                src={
                  isPreviewBroken
                    ? "/empty-image.svg"
                    : resolveFileUrl(value.url)
                }
                alt="Logo nhà cung cấp"
                className={cn(
                  "size-full",
                  isPreviewBroken ? "object-contain p-4" : "object-cover"
                )}
                onError={() => setIsPreviewBroken(true)}
              />
            ) : (
              <>
                <ImageUp className="size-6 text-muted-foreground/60" />
                <p className="text-[11px] text-muted-foreground">
                  Kéo thả ảnh vào đây hoặc{" "}
                  <span className="font-medium text-primary">chọn file</span>
                </p>
              </>
            )}

            {isPending ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Outside the dropzone root, or clicking it would reopen the picker.
            Without it there is no way to clear an image, which makes the
            update endpoint's `imageFileId: null` branch unreachable. */}
        {value && !disabled ? (
          <button
            type="button"
            aria-label="Xóa logo"
            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-destructive"
            onClick={() => {
              setIsPreviewBroken(false)
              setClientError(null)
              onChange(null)
            }}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Định dạng: JPG, PNG, WEBP, GIF (tối đa 5MB)
      </p>

      {errorMessage ? (
        <p className="max-w-40 text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
