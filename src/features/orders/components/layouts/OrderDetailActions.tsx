import { useNavigate } from "@tanstack/react-router"
import { PenNewSquare, TrashBinTrash } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteOrderDialog } from "@/features/orders/components/composites/DeleteOrderDialog"
import { OrderApprovalActions } from "@/features/orders/components/layouts/OrderApprovalActions"
import { OrderExportActions } from "@/features/orders/components/layouts/OrderExportActions"
import {
  canUpdateOrder,
  OrderStatus,
  resolveOrderUpdateDisabledHint,
} from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailActionsProps = {
  order: OrderDetail
}

export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const navigate = useNavigate()
  const isEditable = canUpdateOrder(order.status)
  // Same rule as the backend's ensureOrderDeletable: only orders never approved can be deleted.
  const canDelete =
    order.status === OrderStatus.DRAFT || order.status === OrderStatus.REJECTED

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

      {canDelete && (
        <PermissionGate permission="orders:delete">
          <DeleteOrderDialog
            order={order}
            onDeleted={() =>
              void navigate({
                to: "/manage/orders",
                search: { page: 1, limit: 10 },
              })
            }
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive"
              >
                <TrashBinTrash className="size-4" />
                Xoá
              </Button>
            }
          />
        </PermissionGate>
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
              <IconComponent className="size-4" />
              {label}
            </Button>
          </span>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
