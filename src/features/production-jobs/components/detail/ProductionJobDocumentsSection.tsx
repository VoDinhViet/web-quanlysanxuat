import { useQuery } from "@tanstack/react-query"
import { Documents, FileText } from "@solar-icons/react"
import { DateTime } from "luxon"

import { Spinner } from "@/components/ui/spinner"
import { productionJobAttachmentsQueryOptions } from "@/features/production-jobs/api/options"
import { resolveFileUrl } from "@/lib/file-url"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type ProductionJobDocumentsSectionProps = {
  productionJobId: string
}

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — Job has no
// attachment table of its own, so this reads through the FG product's own documents
// (GET /production-jobs/:jobId/attachments). Read-only: there is no upload/delete route at the
// Job level. Markup mirrors OrderDetailAttachmentsCard.tsx (flat FileResource instead of the
// nested `{id, file}` join shape).
export function ProductionJobDocumentsSection({
  productionJobId,
}: ProductionJobDocumentsSectionProps) {
  const attachmentsQuery = useQuery(
    productionJobAttachmentsQueryOptions(productionJobId)
  )

  if (attachmentsQuery.isPending) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }

  if (attachmentsQuery.isError) {
    return (
      <p className="py-2 text-xs text-muted-foreground">
        {attachmentsQuery.error.message}
      </p>
    )
  }

  const attachments = attachmentsQuery.data

  return attachments.length > 0 ? (
    <ul className="space-y-1.5">
      {attachments.map((file) => (
        <li key={file.id}>
          {/* The download route is @Public(), so the signed URL opens in
              a new tab without an auth header. */}
          <a
            href={resolveFileUrl(file.url)}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
            <span className="shrink-0 text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            <span className="hidden shrink-0 text-muted-foreground sm:inline">
              {DateTime.fromISO(file.createdAt).toFormat("dd/MM/yyyy")}
            </span>
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
      <Documents className="size-7 text-muted-foreground/40" />
      <p className="text-[11px] font-medium text-muted-foreground">
        Chưa có tài liệu đính kèm
      </p>
    </div>
  )
}
