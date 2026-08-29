import { useState } from "react"
import prettyBytes from "pretty-bytes"
import { FileSpreadsheet, FileText, FileType, X } from "lucide-react"
import { Gallery } from "@solar-icons/react"
import { ErrorCode } from "react-dropzone"
import type { FileRejection } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { ComponentType } from "react"

type DocBadge = {
  icon: ComponentType<{ className?: string }>
  className: string
}

// Categorical color per doc type — dùng cho bằng chứng IQC/OQC, trộn cả ảnh lẫn PDF/DOCX/XLSX
// (ACCEPTED_EVIDENCE_TYPES), khác OrderDocumentsField (chỉ toàn document).
export function resolveDocBadge(mimetype: string): DocBadge {
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

export function resolveDropRejectionMessage(
  rejections: FileRejection[]
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return "Chỉ chấp nhận ảnh hoặc PDF/DOCX/XLSX."
    case ErrorCode.FileTooLarge:
      return "Kích thước file vượt quá giới hạn cho phép."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

type QcEvidenceThumbnailProps = {
  file: FileFieldValue
  onRemove: (id: string) => void
  disabled?: boolean
}

// `isBroken` — <img> error event bắt trường hợp file đã bị xoá khỏi storage, rơi về icon thay vì
// ảnh vỡ. Ảnh nhấn vào mở ImageLightbox tại chỗ (zoom/xoay); PDF/DOCX/XLSX vẫn mở tab mới như cũ
// — không zoom được các định dạng đó.
export function QcEvidenceThumbnail({
  file,
  onRemove,
  disabled,
}: QcEvidenceThumbnailProps) {
  const [isBroken, setIsBroken] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const isImage = file.mimetype.startsWith("image/")
  const canPreview = isImage && !isBroken
  const fileUrl = resolveFileUrl(file.url)
  const docBadge = isImage ? null : resolveDocBadge(file.mimetype)

  const thumbnail = canPreview ? (
    <div className="aspect-square w-full overflow-hidden bg-muted">
      <img
        src={fileUrl}
        alt={file.originalName}
        className="size-full object-cover"
        onError={() => setIsBroken(true)}
      />
    </div>
  ) : (
    <div
      className={cn(
        "flex aspect-square w-full items-center justify-center",
        docBadge ? docBadge.className : "bg-muted text-muted-foreground/40"
      )}
    >
      {docBadge ? (
        <docBadge.icon className="size-6" />
      ) : (
        <Gallery className="size-6" />
      )}
    </div>
  )

  const caption = (
    <div className="space-y-0 px-1.5 py-1">
      <p className="truncate text-[11px] font-medium text-foreground">
        {file.originalName}
      </p>
      <p className="text-[10px] text-muted-foreground">
        {prettyBytes(file.size)}
      </p>
    </div>
  )

  return (
    <li className="relative overflow-hidden rounded-md border border-border bg-card">
      {canPreview ? (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="block w-full text-left hover:opacity-90"
        >
          {thumbnail}
          {caption}
        </button>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="block hover:opacity-90"
        >
          {thumbnail}
          {caption}
        </a>
      )}

      {canPreview && (
        <ImageLightbox
          src={fileUrl}
          alt={file.originalName}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}

      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        disabled={disabled}
        aria-label={`Xóa ${file.originalName}`}
        onClick={() => onRemove(file.id)}
        className="absolute top-1 right-1 rounded-full border-border/60 bg-background/90 shadow-sm hover:border-destructive/40 hover:text-destructive"
      >
        <X className="size-3" />
      </Button>
    </li>
  )
}
