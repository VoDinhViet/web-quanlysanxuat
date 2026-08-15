import { Link } from "@tanstack/react-router"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { IqcDetailActions } from "@/features/iqc/components/detail/IqcDetailActions"
import {
  IqcResultBadge,
  IqcStatusBadge,
} from "@/features/iqc/components/IqcBadges"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import { IqcStatus } from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type IqcDetailHeaderProps = {
  form: IqcDetailFormApi
  iqc: IqcDetail
  isPending: boolean
}

// Identity + info row, same shell as PurchaseOrderDetailHeader.tsx — 6th duplicate of the
// MetaField tile idiom, per the repo's own "no abstraction until 3rd use" convention already
// applied consistently at the other 5 sites.
export function IqcDetailHeader({
  form,
  iqc,
  isPending,
}: IqcDetailHeaderProps) {
  const isLocked = iqc.status === IqcStatus.WAITING_RETURN

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách IQC"
            asChild
          >
            <Link to="/manage/iqc" search={{ page: 1, limit: 10 }}>
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {iqc.code}
          </span>
          <IqcStatusBadge status={iqc.status} />
          <IqcResultBadge result={iqc.result} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetaField
            label="Mã NK"
            value={iqc.inventoryReceipt?.code ?? "Không có"}
          />
          <MetaField label="Mã vật tư" value={iqc.item.code} />
          <MetaField label="Tên vật tư" value={iqc.item.name} />
          <MetaField label="Đvt" value={iqc.item.unit.name} />
          <MetaField
            label="Lot size"
            value={quantityFormatter.format(iqc.quantity)}
          />
        </div>
      </div>

      <IqcDetailActions
        form={form}
        iqc={iqc}
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
