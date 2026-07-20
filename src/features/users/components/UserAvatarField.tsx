import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { Camera, Loader2, UserRound } from "lucide-react"
import { ErrorCode, useDropzone } from "react-dropzone"

import { resolveFileUrl } from "@/lib/file-url"
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import type { FileFieldValue } from "@/lib/file-field.schema"
import { cn } from "@/lib/utils"
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

type UserAvatarFieldProps = {
  value: FileFieldValue | null
  onChange: (value: FileFieldValue | null) => void
  disabled?: boolean
}

export function UserAvatarField({
  value,
  onChange,
  disabled,
}: UserAvatarFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadAvatarFn = useServerFn(uploadFile)

  const {
    mutate: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "USER_AVATAR")
      return uploadAvatarFn({ data: formData })
    },
    onSuccess: (result) =>
      onChange({
        id: result.id,
        url: result.url,
        originalName: result.originalName,
      }),
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
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="self-center text-xs font-medium text-foreground">
        Ảnh đại diện
      </span>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải ảnh đại diện lên",
          className: cn(
            "relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-input bg-muted/40 transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          {value ? (
            <img
              src={resolveFileUrl(value.url)}
              alt="Ảnh đại diện"
              className="size-full object-cover"
              // The signed URL expires after ~1h; fall back rather than showing
              // a broken-image glyph.
              onError={(event) => {
                event.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <UserRound className="size-14 text-muted-foreground/60" />
          )}

          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background"
        >
          <Camera className="size-4" />
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Kéo thả hoặc bấm <Camera className="inline size-3 -translate-y-px" /> ·
        JPG, PNG, WEBP, GIF · tối đa 5MB
      </p>

      {errorMessage ? (
        <p className="max-w-40 text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
