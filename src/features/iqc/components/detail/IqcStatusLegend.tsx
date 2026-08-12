import { InfoCircle } from "@solar-icons/react"

import { PendingAction } from "@/components/shared/PendingAction"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import { iqcStatusStyles } from "@/features/iqc/components/IqcBadges"
import {
  iqcStatusDescriptions,
  iqcStatusLabels,
  IqcStatus,
} from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"

const statuses = Object.values(IqcStatus)

type IqcStatusLegendProps = {
  current: IqcStatus
}

// Modeled on PurchaseOrderStatusLegend.tsx — lists all 4 IqcStatus values, highlighting the row
// matching this record's own status. PENDING now has a real inline action (IqcDispositionCard on
// this same page), so no hint needed there anymore. The WAITING_RETURN row adds a small
// PendingAction hint instead — that transition (xuất hàng NG, nối với phiếu trả NCC thật) is the
// piece still explicitly out of scope (see docs/domains/quality.md).
export function IqcStatusLegend({ current }: IqcStatusLegendProps) {
  return (
    <IqcDetailSectionCard icon={InfoCircle} title="Chú thích trạng thái">
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
                  iqcStatusStyles[status].dot
                )}
              />
              {iqcStatusLabels[status]}
            </dt>
            <dd className="space-y-1.5 text-[11px] text-muted-foreground">
              <p>{iqcStatusDescriptions[status]}</p>
              {status === IqcStatus.WAITING_RETURN && (
                <PendingAction
                  label="Xuất trả NCC"
                  hint="Nối với phiếu trả NCC thật (xuất hàng NG) — chuyển Hoàn thành sắp có"
                  variant="ghost"
                >
                  Xuất trả NCC →
                </PendingAction>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </IqcDetailSectionCard>
  )
}
