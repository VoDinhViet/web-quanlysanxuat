import {
  BillList,
  Box,
  CartLarge2,
  DocumentAdd,
  InboxIn,
  InboxOut,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { LinkButton } from "@/components/ui/button"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import type { ManageRoutePath } from "@/lib/route-permissions"

type QuickAction = {
  label: string
  icon: ComponentType<IconProps>
  to: ManageRoutePath
}

const tileClassName =
  "h-auto flex-col gap-1.5 px-2 py-4 text-center text-xs whitespace-normal"

const quickActions: QuickAction[] = [
  {
    label: "Tạo DO",
    icon: InboxOut,
    to: "/manage/outbound-orders/create",
  },
  {
    label: "Tạo NCR",
    icon: DocumentAdd,
    to: "/manage/ncrs/create",
  },
  {
    label: "Đề xuất mua",
    icon: CartLarge2,
    to: "/manage/purchase-requests/create",
  },
  {
    label: "Nhập OS về",
    icon: InboxIn,
    to: "/manage/outsourcing-receipts/create",
  },
  {
    label: "Nhập kho",
    icon: Box,
    to: "/manage/inventory-receipts/create-receipt",
  },
  {
    label: "Báo giá (RFQ)",
    icon: BillList,
    to: "/manage/purchase-quotations/create",
  },
]

export function ManageQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickActions.map((action) => (
        <RoutePermissionGate key={action.label} route={action.to}>
          <LinkButton
            to={action.to}
            variant="outline"
            className={tileClassName}
          >
            <action.icon className="size-6 text-primary" />
            <span>{action.label}</span>
          </LinkButton>
        </RoutePermissionGate>
      ))}
    </div>
  )
}
