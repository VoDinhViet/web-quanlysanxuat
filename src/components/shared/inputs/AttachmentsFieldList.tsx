import { FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"

type AttachmentsFieldListProps = {
  value: FileFieldValue[]
  onRemove: (id: string) => void
  disabled?: boolean
  layout: "grid" | "list"
}

// Split out of AttachmentsField.tsx to keep that file under the ~150-line component limit.
export function AttachmentsFieldList({
  value,
  onRemove,
  disabled,
  layout,
}: AttachmentsFieldListProps) {
  if (value.length === 0) {
    return null
  }

  return (
    <ul
      className={cn(
        layout === "grid" ? "grid gap-2 sm:grid-cols-2" : "space-y-1.5"
      )}
    >
      {value.map((attachment) => (
        <li
          key={attachment.id}
          className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
        >
          <a
            href={resolveFileUrl(attachment.url)}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 text-xs text-foreground hover:text-primary hover:underline"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{attachment.originalName}</span>
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Xóa ${attachment.originalName}`}
            onClick={() => onRemove(attachment.id)}
          >
            <X className="size-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
