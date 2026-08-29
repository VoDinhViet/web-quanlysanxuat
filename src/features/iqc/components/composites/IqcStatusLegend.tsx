import { Link } from "@tanstack/react-router"
import { InfoCircle } from "@solar-icons/react"

import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { Button } from "@/components/ui/button"
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
// this same page), so no hint needed there anymore. The WAITING_RETURN row links to the real
// auto-generated phiếu trả NCC once one exists; a PendingAction placeholder is still the fallback
// for the rare case a WAITING_RETURN row predates the auto-generation flow.
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
            <dd className="space-y-1.5 text-[11px] text-muted-foreground">
              <p>{iqcStatusDescriptions[status]}</p>
              {status === IqcStatus.WAITING_RETURN &&
                (supplierReturn ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-[11px]"
                    asChild
                  >
                    <Link
                      to="/manage/supplier-returns/$supplierReturnId"
                      params={{ supplierReturnId: supplierReturn.id }}
                    >
                      Xem phiếu trả NCC ({supplierReturn.code}) →
                    </Link>
                  </Button>
                ) : (
                  <PendingAction
                    label="Xuất trả NCC"
                    hint="Dòng này chưa có phiếu trả NCC liên kết"
                    variant="ghost"
                  >
                    Xuất trả NCC →
                  </PendingAction>
                ))}
            </dd>
          </div>
        ))}
      </dl>
    </IqcDetailSectionCard>
  )
}
