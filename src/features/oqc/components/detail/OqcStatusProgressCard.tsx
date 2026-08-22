import { Route } from "@solar-icons/react"

import { OqcDetailSectionCard } from "@/features/oqc/components/detail/OqcDetailSectionCard"
import { oqcStatusStyles } from "@/features/oqc/components/OqcBadges"
import {
  oqcStatusDescriptions,
  oqcStatusLabels,
  OqcStatus,
} from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"

const statuses = Object.values(OqcStatus)

type OqcStatusProgressCardProps = {
  current: OqcStatus
}

// TIẾN TRÌNH — liệt kê cả 4 OqcStatus, tô đậm dòng đang là trạng thái hiện tại. Mirror
// IqcStatusLegend.tsx, bỏ nhánh supplierReturn (OQC không có tham chiếu trả NCC). Dùng lại
// oqcStatusDescriptions — có sẵn trong oqc.type.ts nhưng trước giờ chưa nơi nào đọc tới.
export function OqcStatusProgressCard({ current }: OqcStatusProgressCardProps) {
  return (
    <OqcDetailSectionCard
      icon={Route}
      title="Tiến trình"
      description="Dòng đang tô đậm là trạng thái hiện tại"
    >
      <dl className="flex flex-col gap-3">
        {statuses.map((status) => (
          <div
            key={status}
            className={cn(
              "min-w-0 space-y-1 rounded-md",
              status === current && "-mx-2 bg-muted/50 px-2 py-1.5"
            )}
          >
            <dt className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  oqcStatusStyles[status].dot
                )}
              />
              {oqcStatusLabels[status]}
            </dt>
            <dd className="text-[11px] text-muted-foreground">
              {oqcStatusDescriptions[status]}
            </dd>
          </div>
        ))}
      </dl>
    </OqcDetailSectionCard>
  )
}
