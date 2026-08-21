import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  OqcResultBadge,
  OqcStatusBadge,
} from "@/features/oqc/components/OqcBadges"
import { OqcDetailActions } from "@/features/oqc/components/detail/OqcDetailActions"
import type { OqcDetailFormApi } from "@/features/oqc/hooks/use-oqc-detail-form"
import { OqcStatus } from "@/lib/types/oqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OqcDetailHeaderProps = {
  form: OqcDetailFormApi
  oqc: OqcDetail
  isPending: boolean
}

// Identity + info row, same shell as IqcDetailHeader.tsx. `productionJob` link đi thẳng tới
// trang chi tiết Job có sẵn (/manage/production-jobs/$productionJobId) — không cần dropdown
// "Khác" như IqcDetailActions vì đây là tham chiếu duy nhất OQC có.
export function OqcDetailHeader({
  form,
  oqc,
  isPending,
}: OqcDetailHeaderProps) {
  const isLocked = oqc.status === OqcStatus.COMPLETED

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách OQC"
            asChild
          >
            <Link to="/manage/oqc" search={{ page: 1, limit: 10 }}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {oqc.code}
          </span>
          <OqcStatusBadge status={oqc.status} />
          <OqcResultBadge result={oqc.result} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetaField label="PO" value={oqc.orderCode ?? "—"} />
          <MetaField
            label="Job (LSX)"
            value={
              <Link
                to="/manage/production-jobs/$productionJobId"
                params={{ productionJobId: oqc.productionJob.id }}
                search={{ tab: "info" }}
                className="font-mono text-primary hover:underline"
              >
                {oqc.productionJob.code}
              </Link>
            }
          />
          <MetaField label="Công đoạn" value={oqc.operation.name} />
          <MetaField label="Mã part" value={oqc.bomItem.code} />
          <MetaField label="Tên Part" value={oqc.bomItem.name} />
          <MetaField label="Đvt" value={oqc.unit.name} />
          <MetaField
            label="Lot size"
            value={quantityFormatter.format(oqc.quantity)}
          />
          <MetaField
            label="Ngày kiểm tra"
            value={DateTime.fromISO(oqc.inspectionDate).toFormat("dd/MM/yyyy")}
          />
          <MetaField label="Ghi chú" value={oqc.note ?? "—"} />
        </div>
      </div>

      <OqcDetailActions
        form={form}
        oqc={oqc}
        isLocked={isLocked}
        isPending={isPending}
      />
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
