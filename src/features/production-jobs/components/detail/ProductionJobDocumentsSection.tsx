import { DateTime } from "luxon"
import { FileText, Inbox } from "lucide-react"

import type { ProductionJobMockDocument } from "@/lib/types/production-job.type"

type ProductionJobDocumentsSectionProps = {
  documents: ProductionJobMockDocument[]
}

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — danh sách tài liệu
// đính kèm Job. Chưa nối POST /api/files nên chưa có nút tải lên; đây chỉ là danh sách đọc, cùng
// idiom rỗng với ProductDetailSidebar's attachments block.
export function ProductionJobDocumentsSection({
  documents,
}: ProductionJobDocumentsSectionProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
        <Inbox className="size-7 text-muted-foreground/40" />
        <p className="text-xs font-medium text-muted-foreground">
          Chưa có tài liệu đính kèm
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {documents.map((document) => (
        <li key={document.id}>
          <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {document.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {document.sizeLabel} ·{" "}
                {DateTime.fromISO(document.uploadedAt).toFormat("dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
