import { FileDownload, PenNewSquare, Printer } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Button, LinkButton } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { OrderApprovalActions } from "@/features/orders/components/layouts/OrderApprovalActions"
import {
  canUpdateOrder,
  resolveOrderUpdateDisabledHint,
} from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailActionsProps = {
  order: OrderDetail
}

// In / Xuất Excel / Chỉnh sửa — printing and Excel export don't exist yet, so both stay
// disabled with the generic "tính năng sắp có" hint, same idiom as OrderActionsCell's
// row-level actions.
export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const isEditable = canUpdateOrder(order.status)

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <OrderApprovalActions order={order} />
      <DisabledAction icon={Printer} label="In" />
      <DisabledAction icon={FileDownload} label="Xuất Excel" />
      {isEditable ? (
        <RoutePermissionGate route="/manage/orders/$orderId/update">
          <LinkButton
            to="/manage/orders/$orderId/update"
            params={{ orderId: order.id }}
          >
            <PenNewSquare className="size-4" />
            Chỉnh sửa
          </LinkButton>
        </RoutePermissionGate>
      ) : (
        <DisabledAction
          icon={PenNewSquare}
          label="Chỉnh sửa"
          hint={resolveOrderUpdateDisabledHint(order.status)}
        />
      )}
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
    <TooltipTrigger>
      <span>
        <Button
          type="button"
          variant="outline"
          isDisabled
          className="pointer-events-none text-muted-foreground"
        >
          <IconComponent className="size-4" />
          {label}
        </Button>
      </span>
      <Tooltip>{hint}</Tooltip>
    </TooltipTrigger>
  )
}
