import { useState } from "react"
import prettyBytes from "pretty-bytes"
import {
  Archive,
  Document,
  DocumentText,
  Eye,
  SquareArrowRightUp,
  TrashBinTrash,
} from "@solar-icons/react"
import { ErrorCode } from "react-dropzone"
import type { FileRejection } from "react-dropzone"

import { Button, buttonVariants } from "@/components/ui/button"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"

export function resolveDropRejectionMessage(
  rejections: FileRejection[]
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return "Định dạng file không được hỗ trợ."
    case ErrorCode.FileTooLarge:
      return "Kích thước file vượt quá giới hạn cho phép."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

// Tinted file-type tile for non-image evidence (ACCEPTED_EVIDENCE_TYPES mixes images with
// PDF/Word/Excel).
function DocTile({ mimetype }: { mimetype: string }) {
  let Icon = DocumentText
  let tint = "bg-muted text-muted-foreground"

  if (mimetype === "application/pdf") {
    tint = "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
  } else if (mimetype.includes("word")) {
    tint = "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
  } else if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    mimetype.includes("csv")
  ) {
    tint = "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400"
    Icon = Document
  } else if (mimetype.includes("zip") || mimetype.includes("compressed")) {
    tint = "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
    Icon = Archive
  }

  return (
    <span
      className={cn(
        "flex size-full items-center justify-center rounded-md",
        tint
      )}
    >
      <Icon className="size-5" />
    </span>
  )
}

function resolveExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".")

  return dotIndex === -1 ? "" : fileName.slice(dotIndex + 1).toUpperCase()
}

type QcEvidenceThumbnailProps = {
  file: FileFieldValue
  onRemove: (id: string) => void
  disabled?: boolean
}

// One flat row per file (separated by a bottom border): thumbnail (or a file icon), name, "PNG · 38.1 kB", and a remove button. The
// whole row opens the file — an image in the lightbox (zoom/rotate), anything else in a new tab.
// `isBroken` — the <img> error event catches a file already deleted from storage and falls back
// to the icon instead of a broken image.
export function QcEvidenceThumbnail({
  file,
  onRemove,
  disabled,
}: QcEvidenceThumbnailProps) {
  const [isBroken, setIsBroken] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const canPreview = file.mimetype.startsWith("image/") && !isBroken
  const fileUrl = resolveFileUrl(file.url)
  const extension = resolveExtension(file.originalName)

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {canPreview ? (
          <img
            src={fileUrl}
            alt={file.originalName}
            className="size-full object-cover"
            onError={() => setIsBroken(true)}
          />
        ) : (
          <DocTile mimetype={file.mimetype} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          title={file.originalName}
          className="block truncate text-sm font-medium text-foreground"
        >
          {file.originalName}
        </span>
        <span className="block text-xs text-muted-foreground">
          {extension && `${extension} · `}
          {prettyBytes(file.size)}
        </span>
      </span>
    </>
  )

  const rowClassName =
    "flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left outline-none focus-visible:bg-muted/60"

  return (
    <li className="flex items-center border-b border-border pr-3 transition-colors hover:bg-muted/40">
      {canPreview ? (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className={rowClassName}
        >
          {content}
        </button>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className={rowClassName}
        >
          {content}
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

      <div className="flex shrink-0 items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger
            render={
              canPreview ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Xem ${file.originalName}`}
                  onClick={() => setPreviewOpen(true)}
                  className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  <Eye className="size-3.5" />
                </Button>
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Mở ${file.originalName}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "text-muted-foreground hover:border-primary/30 hover:text-primary"
                  )}
                >
                  <SquareArrowRightUp className="size-3.5" />
                </a>
              )
            }
          />
          <TooltipContent>{canPreview ? "Xem ảnh" : "Mở tệp"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={disabled}
                aria-label={`Xóa ${file.originalName}`}
                onClick={() => onRemove(file.id)}
                className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
              >
                <TrashBinTrash className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent>Xóa</TooltipContent>
        </Tooltip>
      </div>
    </li>
  )
}
