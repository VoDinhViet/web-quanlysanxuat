import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import {
  NcrOqcRefBadge,
  NcrStatusBadge,
} from "@/features/ncrs/components/primitives/NcrBadges"
import { ncrProductionActionLabels } from "@/lib/types/ncr.type"
import { productionOrderStatusLabels } from "@/lib/types/production-order.type"
import type { NcrDetail, NcrOqcRef } from "@/lib/types/ncr.type"

type NcrTraceCardProps = {
  ncr: NcrDetail
}

type TraceGroupProps = {
  title: string
  children: ReactNode
}

function TraceGroup({ title, children }: TraceGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function TraceRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      {children}
    </li>
  )
}

const monoLinkClassName = "font-mono font-medium text-primary hover:underline"

function OqcTraceRow({ oqc }: { oqc: NcrOqcRef }) {
  return (
    <TraceRow>
      <Link
        to="/manage/oqc/$oqcId"
        params={{ oqcId: oqc.id }}
        className={monoLinkClassName}
      >
        {oqc.code}
      </Link>
      <NcrOqcRefBadge oqc={oqc} />
    </TraceRow>
  )
}

// Truy vết hai chiều của NCR: nó từ đâu ra (OQC nguồn / NCR cha) và sau xử lý đã sinh gì
// (LSX phụ, phiếu OQC lại, NCR con). Mỗi dòng là liên kết sang chứng từ tương ứng.
export function NcrTraceCard({ ncr }: NcrTraceCardProps) {
  const {
    qualityInspection,
    parentNcr,
    productionOrders,
    reinspections,
    childNcrs,
  } = ncr

  return (
    <NcrSectionCard
      title="Truy vết"
      description="Chứng từ sinh ra NCR và chứng từ phát sinh từ NCR"
    >
      <div className="space-y-4">
        <TraceGroup title="Nguồn gốc">
          {qualityInspection ? (
            <OqcTraceRow oqc={qualityInspection} />
          ) : (
            <TraceRow>
              <span className="text-muted-foreground">NCR tạo thủ công</span>
            </TraceRow>
          )}
          {parentNcr && (
            <TraceRow>
              <Link
                to="/manage/ncrs/$ncrId"
                params={{ ncrId: parentNcr.id }}
                className={monoLinkClassName}
              >
                {parentNcr.code}
              </Link>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">NCR cha</span>
                <NcrStatusBadge status={parentNcr.status} />
              </span>
            </TraceRow>
          )}
        </TraceGroup>

        {productionOrders.length > 0 && (
          <TraceGroup title="Lệnh sản xuất phụ">
            {productionOrders.map((productionOrder) => (
              <TraceRow key={productionOrder.id}>
                <Link
                  to="/manage/production-orders/$productionOrderId"
                  params={{ productionOrderId: productionOrder.id }}
                  className={monoLinkClassName}
                >
                  {productionOrder.code}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {ncrProductionActionLabels[productionOrder.ncrAction]} ·{" "}
                  {productionOrderStatusLabels[productionOrder.status]}
                </span>
              </TraceRow>
            ))}
          </TraceGroup>
        )}

        {reinspections.length > 0 && (
          <TraceGroup title="OQC lại">
            {reinspections.map((reinspection) => (
              <OqcTraceRow key={reinspection.id} oqc={reinspection} />
            ))}
          </TraceGroup>
        )}

        {childNcrs.length > 0 && (
          <TraceGroup title="NCR phát sinh thêm">
            {childNcrs.map((childNcr) => (
              <TraceRow key={childNcr.id}>
                <Link
                  to="/manage/ncrs/$ncrId"
                  params={{ ncrId: childNcr.id }}
                  className={monoLinkClassName}
                >
                  {childNcr.code}
                </Link>
                <NcrStatusBadge status={childNcr.status} />
              </TraceRow>
            ))}
          </TraceGroup>
        )}
      </div>
    </NcrSectionCard>
  )
}
