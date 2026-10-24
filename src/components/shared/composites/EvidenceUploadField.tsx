import { useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { Camera, Loader2, Paperclip } from "lucide-react"
import type { ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  QcEvidenceThumbnail,
  resolveDropRejectionMessage,
} from "@/components/shared/composites/QcEvidenceThumbnail"
import { compressImageIfLarge, isCompressibleImage } from "@/lib/compress-image"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/types/file.type"
import type { UploadType } from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { usePasteToDropzone } from "@/hooks/use-paste-to-dropzone"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"

type EvidenceUploadFieldProps = {
  value: FileFieldValue[]
  onChange: (
    value: FileFieldValue[] | ((prev: FileFieldValue[]) => FileFieldValue[])
  ) => void
  // Must map to FileKind.EVIDENCE on the backend (images + documents).
  uploadType: UploadType
  disabled?: boolean
  // Lets the parent block submit/close while a photo is still uploading.
  onUploadingChange?: (isUploading: boolean) => void
}

// Photos are downscaled before upload, so the picker accepts bigger originals than the backend cap;
// other files must already fit it.
const MAX_PHOTO_PICK_BYTES = 30 * 1024 * 1024

// Optional evidence attached when a warehouse document is confirmed (supplier return, stock issue):
// images and documents, same shape as JobOperationReportEvidenceField. "Chụp ảnh" opens the rear
// camera on a phone; large photos are downscaled before upload (compressImageIfLarge).
export function EvidenceUploadField({
  value,
  onChange,
  uploadType,
  disabled,
  onUploadingChange,
}: EvidenceUploadFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadFileFn = useServerFn(uploadFile)

  const {
    mutateAsync: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", await compressImageIfLarge(file))
      formData.append("type", uploadType)
      return uploadFileFn({ data: formData })
    },
  })

  const uploadFiles = async (files: File[]) => {
    setClientError(null)
    const uploadable = files.filter(
      (file) =>
        isCompressibleImage(file) || file.size <= MAX_DOCUMENT_SIZE_BYTES
    )
    const oversizedCount = files.length - uploadable.length

    onUploadingChange?.(true)
    try {
      const results = await Promise.allSettled(
        uploadable.map((file) => upload(file))
      )
      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)

      if (uploaded.length > 0) {
        onChange((prev) => [...prev, ...uploaded])
      }

      const failedCount = results.length - uploaded.length + oversizedCount
      if (failedCount > 0) {
        setClientError(
          `${failedCount} file tải lên thất bại (file tài liệu tối đa 10MB). Vui lòng thử lại.`
        )
      }
    } finally {
      onUploadingChange?.(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive, rootRef, inputRef } =
    useDropzone({
      accept: ACCEPTED_EVIDENCE_TYPES,
      maxSize: MAX_PHOTO_PICK_BYTES,
      multiple: true,
      disabled,
      onDropAccepted: uploadFiles,
      onDropRejected: (rejections) =>
        setClientError(resolveDropRejectionMessage(rejections)),
    })

  const handleCameraCapture = (event: ChangeEvent<HTMLInputElement>) => {
    const photos = Array.from(event.target.files ?? [])
    // Reset so taking the same shot again still fires `change`.
    event.target.value = ""
    if (photos.length > 0) void uploadFiles(photos)
  }

  const errorMessage = clientError ?? error?.message

  usePasteToDropzone({ rootRef, inputRef, disabled })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="block text-xs font-medium text-foreground">
          Ảnh / file đính kèm (nếu có)
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          disabled={disabled || isPending}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="size-3.5" aria-hidden />
          Chụp ảnh
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          tabIndex={-1}
          aria-hidden
          onChange={handleCameraCapture}
        />
      </div>

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
            "flex min-h-16 w-full items-center gap-3 rounded-lg border-2 border-dashed border-input bg-muted/40 px-4 py-3 transition-colors hover:border-border hover:bg-muted",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Paperclip className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              Kéo thả, dán (Ctrl+V) file vào đây hoặc{" "}
              <span className="font-medium text-primary">chọn file</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ: Ảnh, PDF, Word, Excel, PowerPoint, File nén... (tối đa
              10MB)
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
        <ul>
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
