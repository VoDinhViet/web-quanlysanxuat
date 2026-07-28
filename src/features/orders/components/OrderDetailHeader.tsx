import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { Icon } from "@iconify/react"
import altArrowLeftBold from "@iconify-icons/solar/alt-arrow-left-bold"
import deliveryBold from "@iconify-icons/solar/delivery-bold"
import fileDownloadBold from "@iconify-icons/solar/file-download-bold"
import penNewSquareBold from "@iconify-icons/solar/pen-new-square-bold"
import printerBold from "@iconify-icons/solar/printer-bold"
import type { IconifyIcon } from "@iconify/types"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OrderStatusBadge } from "@/features/orders/components/OrderBadges"
import { OrderDetailTabs } from "@/features/orders/components/OrderDetailTabs"
import { OVERDUE_FILTER_VALUE } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailHeaderProps = {
  order: OrderDetail
}

// Identity, the status/overdue flags and the tab strip read as one unit, so
// they share a single block instead of floating as separate cards — same
// composition as ProductDetailHeader.
export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách đơn hàng"
            asChild
          >
            <Link to="/manage/orders" search={{ page: 1, limit: 10 }}>
              <Icon icon={altArrowLeftBold} className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 truncate font-mono text-base leading-snug font-semibold text-foreground sm:text-lg">
                {order.code}
              </h2>
              <OrderStatusBadge tone={order.status} />
              {order.expired ? (
                <OrderStatusBadge tone={OVERDUE_FILTER_VALUE} />
              ) : null}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {order.client.name}
              </span>
              <Dot />
              <span>
                Đặt hàng{" "}
                {DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Icon icon={printerBold} className="size-4" />
            In
          </Button>
          <DisabledHeaderAction icon={fileDownloadBold} label="Xuất Excel" />
          <DisabledHeaderAction icon={deliveryBold} label="Tạo DO" />
          <DisabledHeaderAction icon={penNewSquareBold} label="Chỉnh sửa" />
        </div>
      </div>

      <OrderDetailTabs itemCount={order.items.length} />
    </>
  )
}

// A dot separator between the inline meta facts.
function Dot() {
  return <span className="text-border">•</span>
}

type DisabledHeaderActionProps = {
  icon: IconifyIcon
  label: string
}

// Create/update-order and delivery-order screens don't exist yet — same
// "tính năng sắp có" tooltip idiom as OrderActionsCell's row-level actions.
function DisabledHeaderAction({ icon, label }: DisabledHeaderActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            type="button"
            variant="outline"
            disabled
            className="pointer-events-none text-muted-foreground"
          >
            <Icon icon={icon} className="size-4" />
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Tính năng sắp có</TooltipContent>
    </Tooltip>
  )
}
