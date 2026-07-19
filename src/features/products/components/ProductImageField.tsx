import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ImageUp, Loader2 } from "lucide-react"
import { ErrorCode, useDropzone } from "react-dropzone"

import { uploadProductImage } from "@/features/products/server-functions/upload-product-image"
import { cn } from "@/lib/utils"
import type { FileRejection } from "react-dropzone"

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = { "image/jpeg": [], "image/png": [] }

function resolveDropRejectionMessage(
  rejections: FileRejection[]
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return "Chỉ chấp nhận định dạng JPG, PNG."
    case ErrorCode.FileTooLarge:
      return "Kích thước ảnh tối đa 2MB."
    case ErrorCode.TooManyFiles:
      return "Chỉ được chọn 1 ảnh."
    default:
      return rejections.length > 0 ? "Không thể tải ảnh lên." : null
  }
}

type ProductImageFieldProps = {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ProductImageField({
  value,
  onChange,
  disabled,
}: ProductImageFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadImageFn = useServerFn(uploadProductImage)

  const {
    mutate: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return uploadImageFn({ data: formData })
    },
    onSuccess: (result) => onChange(result.url),
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
        Hình ảnh
      </span>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải hình ảnh sản phẩm lên",
          className: cn(
            "relative w-40 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex aspect-square w-40 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/40 p-3 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          {value.length > 0 ? (
            <img
              src={value}
              alt="Hình ảnh sản phẩm"
              className="size-full object-cover"
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

      <p className="text-[11px] text-muted-foreground">
        Định dạng: JPG, PNG (tối đa 2MB)
      </p>

      {errorMessage ? (
        <p className="max-w-40 text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
