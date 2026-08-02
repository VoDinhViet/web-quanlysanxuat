import { Link } from "@tanstack/react-router"
import {
  FileDownload,
  MenuDots,
  PenNewSquare,
  Printer,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { OrderApprovalActions } from "@/features/orders/components/detail/OrderApprovalActions"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailActionsProps = {
  order: OrderDetail
}

// In / Xuất Excel / Chỉnh sửa — printing and Excel export don't exist yet, so both stay
// disabled with the generic "tính năng sắp có" hint, same idiom as OrderActionsCell's
// row-level actions.
export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const isEditable =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <OrderApprovalActions order={order} />
      <DisabledAction icon={Printer} label="In" />
      <DisabledAction icon={FileDownload} label="Xuất Excel" />
      {isEditable ? (
        <PermissionGate permission="orders:update">
          <Button type="button" asChild>
            <Link
              to="/manage/orders/$orderId/update"
              params={{ orderId: order.id }}
            >
              <PenNewSquare className="size-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </PermissionGate>
      ) : (
        <DisabledAction
          icon={PenNewSquare}
          label="Chỉnh sửa"
          hint="Đơn hàng đã hoàn thành hoặc đã hủy nên không thể chỉnh sửa"
        />
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled
              className="pointer-events-none text-muted-foreground"
              aria-label="Thêm tùy chọn"
            >
              <MenuDots className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Tính năng sắp có</TooltipContent>
      </Tooltip>
    </div>
  )
}

type DisabledActionProps = {
  icon: ComponentType<IconProps>
  label: string
  hint?: string
}

function DisabledAction({
  icon: IconComponent,
  label,
  hint = "Tính năng sắp có",
}: DisabledActionProps) {
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
            <IconComponent className="size-4" />
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
