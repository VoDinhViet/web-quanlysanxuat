import { Icon } from "@iconify/react"
import buildings2Bold from "@iconify-icons/solar/buildings-2-bold"
import calendarAddBold from "@iconify-icons/solar/calendar-add-bold"
import clockCircleBold from "@iconify-icons/solar/clock-circle-bold"
import infoCircleBold from "@iconify-icons/solar/info-circle-bold"
import letterBold from "@iconify-icons/solar/letter-bold"
import mapPointBold from "@iconify-icons/solar/map-point-bold"
import phoneBold from "@iconify-icons/solar/phone-bold"
import userBold from "@iconify-icons/solar/user-bold"
import userIdBold from "@iconify-icons/solar/user-id-bold"
import { DateTime } from "luxon"
import type { IconifyIcon } from "@iconify/types"
import type { ReactNode } from "react"

import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailSidebarProps = {
  order: OrderDetail
}

// Keeps the client, delivery and audit facts in view alongside whichever tab
// is active — same role as ProductDetailSidebar.
export function OrderDetailSidebar({ order }: OrderDetailSidebarProps) {
  return (
    <>
      <SidebarSection title="Thông tin khách hàng" icon={buildings2Bold}>
        <dl className="divide-y divide-border">
          <SummaryRow
            icon={buildings2Bold}
            label="Khách hàng"
            value={
              <>
                {order.client.name}{" "}
                <span className="font-mono text-muted-foreground">
                  ({order.client.code})
                </span>
              </>
            }
          />
          <SummaryRow
            icon={userBold}
            label="Người liên hệ"
            value={order.contactName ?? "—"}
          />
          <SummaryRow
            icon={phoneBold}
            label="Điện thoại"
            value={order.contactPhone ?? "—"}
          />
          <SummaryRow
            icon={letterBold}
            label="Email"
            value={order.contactEmail ?? "—"}
          />
        </dl>
      </SidebarSection>

      <SidebarSection title="Địa chỉ giao hàng" icon={mapPointBold} padded>
        <p className="text-xs font-medium break-words text-foreground">
          {order.deliveryAddress || "Chưa có địa chỉ giao hàng"}
        </p>
      </SidebarSection>

      <SidebarSection title="Thông tin khác" icon={infoCircleBold}>
        <dl className="divide-y divide-border">
          <SummaryRow
            icon={userIdBold}
            label="NV kinh doanh"
            value={order.staff?.fullName ?? "—"}
          />
          <SummaryRow
            icon={userBold}
            label="Người tạo"
            value={order.creator?.username ?? "—"}
          />
          <SummaryRow
            icon={calendarAddBold}
            label="Ngày tạo"
            value={DateTime.fromISO(order.createdAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
          <SummaryRow
            icon={clockCircleBold}
            label="Cập nhật"
            value={DateTime.fromISO(order.updatedAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
        </dl>
      </SidebarSection>
    </>
  )
}

type SidebarSectionProps = {
  title: string
  icon: IconifyIcon
  children: ReactNode
  padded?: boolean
}

function SidebarSection({
  title,
  icon,
  children,
  padded,
}: SidebarSectionProps) {
  return (
    <div className="not-first:border-t not-first:border-border">
      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3.5 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Icon icon={icon} className="size-4 text-muted-foreground" />
        {title}
      </h2>
      <div className={padded ? "p-4" : "py-1"}>{children}</div>
    </div>
  )
}

type SummaryRowProps = {
  icon: IconifyIcon
  label: string
  value: ReactNode
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <Icon icon={icon} className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="text-xs font-medium break-words text-foreground">
        {value}
      </dd>
    </div>
  )
}
