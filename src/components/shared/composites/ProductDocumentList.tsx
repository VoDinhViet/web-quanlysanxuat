import prettyBytes from "pretty-bytes"
import { ExternalLink, FileX } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { getDocumentTypeInfo } from "@/lib/document-type"
import { resolveFileUrl } from "@/lib/file-url"
import type { ItemFile } from "@/lib/types/item.type"
import { cn } from "@/lib/utils"

type ProductDocumentListProps = {
  productFiles: ItemFile[]
  className?: string
}

// Read-only view of a product's drawings/documents, shared by the Job detail and the production
// execution screen. Images zoom in place; every other type (PDF, CAD, Excel) opens in a new tab,
// which also lets a phone hand the file to its own viewer.
export function ProductDocumentList({
  productFiles,
  className,
}: ProductDocumentListProps) {
  if (productFiles.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
        <FileX className="size-4 shrink-0" aria-hidden />
        Sản phẩm chưa có bản vẽ / tài liệu đính kèm.
      </div>
    )
  }

  return (
    <ul className={cn("grid grid-cols-1 gap-2 md:grid-cols-2", className)}>
      {productFiles.map(({ id, file }) => {
        const documentType = getDocumentTypeInfo(
          file.mimetype,
          file.originalName
        )
        const DocumentIcon = documentType.icon
        const fileUrl = resolveFileUrl(file.url)
        const isImage = file.mimetype.startsWith("image/")

        return (
          <li
            key={id}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2"
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/50 text-muted-foreground">
              {isImage ? (
                <ZoomableImage src={fileUrl} alt={file.originalName} />
              ) : (
                <DocumentIcon
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                title={file.originalName}
                className="truncate text-sm font-medium text-foreground"
              >
                {file.originalName}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-mono uppercase">
                  {documentType.label}
                </span>
                <span aria-hidden>·</span>
                <span className="font-mono">{prettyBytes(file.size)}</span>
              </p>
            </div>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Mở ${file.originalName} trong tab mới`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                // Shop-floor phones: keep the tap target at 40px below `sm`.
                "h-10 shrink-0 gap-1 text-xs sm:h-8"
              )}
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Mở
            </a>
          </li>
        )
      })}
    </ul>
  )
}
