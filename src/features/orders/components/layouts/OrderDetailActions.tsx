import { PenNewSquare } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { OrderApprovalActions } from "@/features/orders/components/layouts/OrderApprovalActions"
import { OrderExportActions } from "@/features/orders/components/layouts/OrderExportActions"
import {
  canUpdateOrder,
  resolveOrderUpdateDisabledHint,
} from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

type OrderDetailActionsProps = {
  order: OrderDetail
}

export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const isEditable = canUpdateOrder(order.status)

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <OrderApprovalActions order={order} />

      <OrderExportActions orderId={order.id} />

      {isEditable ? (
        <RoutePermissionGate route="/manage/orders/$orderId/update">
          <LinkButton
            to="/manage/orders/$orderId/update"
            params={{ orderId: order.id }}
            variant="outline"
          >
            <PenNewSquare className="size-4 text-amber-600 dark:text-amber-400" />
            Chỉnh sửa
          </LinkButton>
        </RoutePermissionGate>
      ) : (
        <DisabledAction
          icon={PenNewSquare}
          iconClassName="text-amber-600 dark:text-amber-400"
          label="Chỉnh sửa"
          hint={resolveOrderUpdateDisabledHint(order.status)}
        />
      )}
    </div>
  )
}

type DisabledActionProps = {
  icon: ComponentType<IconProps>
  iconClassName?: string
  label: string
  hint?: string
}

function DisabledAction({
  icon: IconComponent,
  iconClassName,
  label,
  hint = "Tính năng sắp có",
}: DisabledActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span>
            <Button
              type="button"
              variant="outline"
              disabled
              className="pointer-events-none text-muted-foreground"
            >
              <IconComponent className={cn("size-4", iconClassName)} />
              {label}
            </Button>
          </span>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
