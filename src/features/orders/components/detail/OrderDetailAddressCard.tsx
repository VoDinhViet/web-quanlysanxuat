import { Icon } from "@iconify/react"
import buildings2Bold from "@iconify-icons/solar/buildings-2-bold"
import mapPointBold from "@iconify-icons/solar/map-point-bold"
import phoneBold from "@iconify-icons/solar/phone-bold"
import userBold from "@iconify-icons/solar/user-bold"
import type { IconifyIcon } from "@iconify/types"
import type { ReactNode } from "react"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailAddressCardProps = {
  order: OrderDetail
}

export function OrderDetailAddressCard({ order }: OrderDetailAddressCardProps) {
  return (
    <OrderDetailSectionCard icon={mapPointBold} title="Địa chỉ giao hàng">
      <dl className="space-y-4">
        <AddressRow
          icon={userBold}
          label="Người nhận"
          value={order.contactName ?? "—"}
        />
        <AddressRow
          icon={buildings2Bold}
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
          icon={mapPointBold}
          label="Địa chỉ"
          value={order.deliveryAddress || "Chưa có địa chỉ giao hàng"}
        />
        <AddressRow
          icon={phoneBold}
          label="Điện thoại"
          value={order.contactPhone ?? "—"}
        />
      </dl>
    </OrderDetailSectionCard>
  )
}

type AddressRowProps = {
  icon: IconifyIcon
  label: string
  value: ReactNode
}

function AddressRow({ icon, label, value }: AddressRowProps) {
  return (
    <div className="flex gap-3">
      <Icon
        icon={icon}
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
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
