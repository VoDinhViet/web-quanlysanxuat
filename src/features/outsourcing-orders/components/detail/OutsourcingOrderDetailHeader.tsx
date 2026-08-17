import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { OutsourcingOrderDetailActions } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderDetailActions"
import { OutsourcingOrderStatusBadge } from "@/features/outsourcing-orders/components/OutsourcingOrderBadges"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderDetailHeaderProps = {
  detail: OutsourcingOrderDetail
}

// Identity row + at-a-glance meta grid + header-level actions — same shell as
// OutsourcingReceiptDetailHeader.tsx. Badge dùng `progress` (đã map sẵn sang
// OutsourcingOrderStatus), không phải `status` (DB status thô).
export function OutsourcingOrderDetailHeader({
  detail,
}: OutsourcingOrderDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách gia công ngoài"
            asChild
          >
            <Link
              to="/manage/outsourcing-orders"
              search={{ page: 1, limit: 10 }}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <OutsourcingOrderStatusBadge status={detail.progress} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <MetaField label="Nhà cung cấp" value={detail.supplier.name} />
          <MetaField label="Kho xuất hàng" value={detail.warehouse.name} />
          <MetaField
            label="Ngày gửi"
            value={DateTime.fromISO(detail.sendDate).toFormat("dd/MM/yyyy")}
          />
          <MetaField
            label="Ngày hẹn về"
            value={
              detail.expectedReturnDate
                ? DateTime.fromISO(detail.expectedReturnDate).toFormat(
                    "dd/MM/yyyy"
                  )
                : "—"
            }
          />
        </div>
      </div>

      <OutsourcingOrderDetailActions detail={detail} />
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

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
