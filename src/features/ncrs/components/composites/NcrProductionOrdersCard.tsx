import { Link } from "@tanstack/react-router"

import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { ncrProductionActionLabels } from "@/lib/types/ncr.type"
import { productionOrderStatusLabels } from "@/lib/types/production-order.type"
import type { NcrDetail } from "@/lib/types/ncr.type"

type NcrProductionOrdersCardProps = {
  productionOrders: NcrDetail["productionOrders"]
}

export function NcrProductionOrdersCard({
  productionOrders,
}: NcrProductionOrdersCardProps) {
  return (
    <NcrSectionCard title="Lệnh sản xuất phụ">
      <ul className="space-y-2">
        {productionOrders.map((productionOrder) => (
          <li
            key={productionOrder.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <Link
              to="/manage/production-orders/$productionOrderId"
              params={{ productionOrderId: productionOrder.id }}
              className="font-mono font-medium text-primary hover:underline"
            >
              {productionOrder.code}
            </Link>
            <span className="text-xs text-muted-foreground">
              {ncrProductionActionLabels[productionOrder.ncrAction]} ·{" "}
              {productionOrderStatusLabels[productionOrder.status]}
            </span>
          </li>
        ))}
      </ul>
    </NcrSectionCard>
  )
}
