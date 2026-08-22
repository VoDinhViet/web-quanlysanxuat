import { Link } from "@tanstack/react-router"
import {
  Bill,
  Calendar,
  Checklist,
  ClipboardText,
  Layers,
  Notes,
} from "@solar-icons/react"
import { DateTime } from "luxon"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { OqcDetailSectionCard } from "@/features/oqc/components/detail/OqcDetailSectionCard"
import { OqcFinishedGoodStrip } from "@/features/oqc/components/detail/OqcFinishedGoodStrip"
import type { OqcDetail } from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"

type OqcLotSummaryCardProps = {
  oqc: OqcDetail
}

// §1 LÔ KIỂM TRA — dải thành phẩm (xem OqcFinishedGoodStrip.tsx) + tham chiếu (PO, Job, Công
// đoạn, ngày kiểm tra, ghi chú — gộp từ lưới 9 MetaField cũ ở OqcDetailHeader.tsx đã bỏ). Tham
// chiếu render dạng ô label/icon/value xếp chồng, cùng idiom IqcGeneralInfoCard.tsx.
export function OqcLotSummaryCard({ oqc }: OqcLotSummaryCardProps) {
  return (
    <OqcDetailSectionCard
      icon={Layers}
      title="Lô kiểm tra"
      description="Thành phẩm, nguồn gốc và thời điểm lấy mẫu"
    >
      <div className="space-y-5">
        <div className="border-b border-border pb-5">
          <OqcFinishedGoodStrip oqc={oqc} />
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          <InfoTile icon={Bill} label="PO" value={oqc.orderCode ?? "—"} />
          <InfoTile
            icon={ClipboardText}
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
          <InfoTile
            icon={Checklist}
            label="Công đoạn"
            value={oqc.operation.name}
          />
          <InfoTile
            icon={Calendar}
            label="Ngày kiểm tra"
            value={DateTime.fromISO(oqc.inspectionDate).toFormat("dd/MM/yyyy")}
          />
          <InfoTile
            icon={Notes}
            label="Ghi chú"
            value={oqc.note ?? "—"}
            className="col-span-2 sm:col-span-3 lg:col-span-1"
          />
        </dl>
      </div>
    </OqcDetailSectionCard>
  )
}

type InfoTileProps = {
  icon: ComponentType<IconProps>
  label: string
  value: ReactNode
  className?: string
}

function InfoTile({ icon: Icon, label, value, className }: InfoTileProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd
        className="line-clamp-2 text-sm font-medium text-foreground"
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
