import { History } from "@solar-icons/react"
import { DateTime } from "luxon"

import { OqcDetailSectionCard } from "@/features/oqc/components/detail/OqcDetailSectionCard"
import type { OqcDetail } from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"

type OqcActivityLogCardProps = {
  oqc: OqcDetail
}

type LogEntry = {
  label: string
  actorName: string | null
  at: string | null
}

// NHẬT KÝ — 3 mốc audit trail của phiếu (tạo → xác nhận → xử lý). oqc.type.ts đã trả về đủ
// creatorBy/createdAt, confirmerBy/confirmedAt, resolverBy/resolvedAt từ trước nhưng chưa nơi
// nào render. Mốc chưa xảy ra (`at` null) hiện "Chưa thực hiện" ở tông muted thay vì ẩn hẳn
// dòng, để một phiếu NOT_INSPECTED vẫn thấy đủ cả 3 bước sắp tới.
export function OqcActivityLogCard({ oqc }: OqcActivityLogCardProps) {
  const entries: LogEntry[] = [
    {
      label: "Tạo phiếu",
      actorName: oqc.creatorBy?.fullName ?? null,
      at: oqc.createdAt,
    },
    {
      label: "Xác nhận kết quả",
      actorName: oqc.confirmerBy?.fullName ?? null,
      at: oqc.confirmedAt,
    },
    {
      label: "Xử lý",
      actorName: oqc.resolverBy?.fullName ?? null,
      at: oqc.resolvedAt,
    },
  ]

  return (
    <OqcDetailSectionCard
      icon={History}
      title="Nhật ký"
      description="Ai đã làm gì, khi nào"
    >
      <ol className="space-y-3 text-xs">
        {entries.map((entry) => (
          <li key={entry.label} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-1 size-1.5 shrink-0 rounded-full",
                entry.at ? "bg-primary" : "bg-muted-foreground/40"
              )}
            />
            <div className="min-w-0">
              <p className="font-medium text-foreground">{entry.label}</p>
              {entry.at ? (
                <p className="text-muted-foreground">
                  {entry.actorName ?? "—"} ·{" "}
                  {DateTime.fromISO(entry.at).toFormat("dd/MM/yyyy HH:mm")}
                </p>
              ) : (
                <p className="text-muted-foreground/60">Chưa thực hiện</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </OqcDetailSectionCard>
  )
}
