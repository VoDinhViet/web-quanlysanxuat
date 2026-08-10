import { Buildings2, MapPoint, Phone } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailAddressCardProps = {
  order: OrderDetail
}

export function OrderDetailAddressCard({ order }: OrderDetailAddressCardProps) {
  return (
    <OrderDetailSectionCard icon={MapPoint} title="Địa chỉ giao hàng">
      <dl className="space-y-4">
        <AddressRow
          icon={Buildings2}
          label="Công ty"
          value={
            <>
              {order.client.name}{" "}
              <span className="font-mono text-muted-foreground">
                ({order.client.code})
              </span>
            </>
          }
        />
        <AddressRow
          icon={MapPoint}
          label="Địa chỉ"
          value={order.deliveryAddress || "Chưa có địa chỉ giao hàng"}
        />
        <AddressRow
          icon={Phone}
          label="Điện thoại"
          value={order.client.phoneNumber ?? "—"}
        />
      </dl>
    </OrderDetailSectionCard>
  )
}

type AddressRowProps = {
  icon: ComponentType<IconProps>
  label: string
  value: ReactNode
}

function AddressRow({ icon: IconComponent, label, value }: AddressRowProps) {
  return (
    <div className="flex gap-3">
      <IconComponent className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 space-y-0.5">
        <dt className="text-[11px] font-medium text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm font-medium break-words text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}
