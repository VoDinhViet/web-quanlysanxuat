import { InfoCircle } from "@solar-icons/react"

import { LinkButton } from "@/components/ui/button"
import { IqcDetailSectionCard } from "@/features/iqc/components/layouts/IqcDetailSectionCard"
import { iqcStatusStyles } from "@/features/iqc/components/primitives/IqcBadges"
import {
  iqcStatusDescriptions,
  iqcStatusLabels,
  IqcStatus,
} from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"

const statuses = Object.values(IqcStatus)

type IqcStatusLegendProps = {
  current: IqcStatus
  supplierReturn: IqcDetail["supplierReturn"]
}

// Modeled on PurchaseOrderStatusLegend.tsx — lists all 4 IqcStatus values, highlighting the row
// matching this record's own status. PENDING now has a real inline action (IqcDispositionCard on
// this same page), so no hint needed there anymore. The row links to the real auto-generated
// phiếu trả NCC once one exists.
export function IqcStatusLegend({
  current,
  supplierReturn,
}: IqcStatusLegendProps) {
  return (
    <IqcDetailSectionCard
      icon={InfoCircle}
      title="Trạng thái IQC"
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
                  iqcStatusStyles[status].dot
                )}
              />
              {iqcStatusLabels[status]}
            </dt>
            <dd className="space-y-1.5 text-xs text-muted-foreground">
              <p>{iqcStatusDescriptions[status]}</p>
              {status === IqcStatus.IN_PROGRESS && supplierReturn && (
                <LinkButton
                  to="/manage/supplier-returns/$supplierReturnId"
                  params={{ supplierReturnId: supplierReturn.id }}
                  variant="link"
                  className="h-auto p-0 text-xs"
                >
                  Xem phiếu trả NCC ({supplierReturn.code}) →
                </LinkButton>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </IqcDetailSectionCard>
  )
}
