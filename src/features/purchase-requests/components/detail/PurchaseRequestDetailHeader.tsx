import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { MissingFieldValue } from "@/components/shared/MissingFieldValue"
import { PurchaseRequestStatusBadge } from "@/features/purchase-requests/components/PurchaseRequestBadges"
import { PurchaseRequestDetailActions } from "@/features/purchase-requests/components/detail/PurchaseRequestDetailActions"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestDetailHeaderProps = {
  detail: PurchaseRequestDetail
  itemCount: number
}

// Chỉ có 1 đường ghi vào purchase_requests hiện nay — ProductionJobsService.startJob — nên có
// productionJob/productionOrder nghĩa là đề xuất tự sinh từ đó; ngược lại là thủ công (tương lai,
// xem docs/domains/purchase-requests.md ở backend).
const getSourceLabel = ({
  productionJob,
  productionOrder,
}: PurchaseRequestDetail): string =>
  productionJob || productionOrder ? "Từ Job/PO" : "Thủ công"

// Identity + info row, same single-block idiom as ProductionJobDetailHeader.tsx —
// `itemCount` is a prop (not `detail.items.length`) so "Tổng số vật tư" tracks the page's own
// editable row list (a vật tư removed locally shouldn't still count here).
export function PurchaseRequestDetailHeader({
  detail,
  itemCount,
}: PurchaseRequestDetailHeaderProps) {
  const source = getSourceLabel(detail)

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách đề xuất mua hàng"
            asChild
          >
            <Link
              to="/manage/purchase-requests"
              search={{ page: 1, limit: 10 }}
            >
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <PurchaseRequestStatusBadge status={detail.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetaField label="Nguồn" value={source} />
          <MetaField
            label="PO liên quan"
            value={
              detail.productionOrder ? (
                <Link
                  to="/manage/production-orders/$productionOrderId"
                  params={{ productionOrderId: detail.productionOrder.id }}
                  className="font-mono text-primary hover:underline"
                >
                  {detail.productionOrder.code ?? "—"}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <MetaField label="Bộ phận đề xuất" value={detail.department.name} />
          <MetaField
            label="Người tạo"
            value={detail.requesterBy?.fullName ?? "—"}
          />
          <MetaField
            label="Ngày tạo"
            value={DateTime.fromISO(detail.createdAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
          <MetaField
            label="Ngày cần"
            value={DateTime.fromISO(detail.neededDate).toFormat("dd/MM/yyyy")}
          />
          <MetaField label="Tổng số vật tư" value={String(itemCount)} />
          <MetaField label="Ghi chú" value={<MissingFieldValue />} />
        </div>
      </div>

      <PurchaseRequestDetailActions detail={detail} />
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

// Same label-above-value tile idiom as ProductionOrderDetailSummaryCard.tsx's MetaField — more
// scannable than the previous inline "label: value" list, and reuses an existing identity-block
// pattern instead of inventing a new one.
function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
