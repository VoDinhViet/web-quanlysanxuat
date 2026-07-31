import { DateTime } from "luxon"
import { Inbox, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ProductionJobMockNote } from "@/lib/types/production-job.type"

type ProductionJobNotesSectionProps = {
  notes: ProductionJobMockNote[]
}

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — mỗi ghi chú gắn
// với người viết + thời điểm (như một dòng bình luận ngắn), cùng ô nhập ghi chú mới bên dưới.
// `readOnly`/`disabled` cho tới khi có mutation thật (task 8.2 là UI-only).
export function ProductionJobNotesSection({
  notes,
}: ProductionJobNotesSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
          <Inbox className="size-7 text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground">
            Chưa có ghi chú nào — thêm ghi chú đầu tiên bên dưới
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {note.authorName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {DateTime.fromISO(note.createdAt).toFormat(
                    "dd/MM/yyyy, HH:mm"
                  )}
                </span>
              </div>
              <p className="mt-0.5 text-xs break-words text-foreground">
                {note.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-start gap-2 border-t border-border pt-3">
        <Textarea
          readOnly
          placeholder="Thêm ghi chú..."
          className="min-h-20 text-xs"
          aria-label="Thêm ghi chú — chưa được kết nối"
        />
        <Button
          type="button"
          size="icon"
          disabled
          aria-label="Gửi ghi chú — chưa được kết nối"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
