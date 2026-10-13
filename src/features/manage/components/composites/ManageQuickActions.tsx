import {
  Bag4,
  BillList,
  Box,
  Buildings2,
  CartLarge2,
  ClipboardAdd,
  DocumentAdd,
  InboxIn,
  InboxOut,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { cn } from "@/lib/utils"
import type { ManageRoutePath } from "@/lib/route-permissions"

type QuickAction = {
  label: string
  icon: ComponentType<IconProps>
} & (
  | { to: ManageRoutePath; hint?: undefined }
  | { to?: undefined; hint: string }
)

const tileClassName =
  "h-auto flex-col gap-1.5 px-2 py-4 text-center text-xs whitespace-normal"

const quickActions: QuickAction[] = [
  {
    label: "Tạo LSX (Job)",
    icon: ClipboardAdd,
    hint: "LSX được tạo tự động khi duyệt LSX từ đơn hàng — chưa có form tạo tay",
  },
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
    to: "/manage/inventory-receipts/create",
  },
  {
    label: "Xuất kho",
    icon: Buildings2,
    hint: "Xuất vật tư/thành phẩm khỏi kho hiện chưa có form tạo tay riêng",
  },
  {
    label: "Báo giá (RFQ)",
    icon: BillList,
    to: "/manage/purchase-quotations/create",
  },
  {
    label: "PO mua hàng",
    icon: Bag4,
    hint: "Đơn mua được tạo tự động khi duyệt báo giá (RFQ) — không có tạo tay",
  },
]

export function ManageQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickActions.map((action) =>
        action.to ? (
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
        ) : (
          <Tooltip key={action.label}>
            <TooltipTrigger
              render={
                <span tabIndex={0}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className={cn(tileClassName, "pointer-events-none w-full")}
                  >
                    <action.icon className="size-6 text-muted-foreground" />
                    <span>{action.label}</span>
                  </Button>
                </span>
              }
            />
            <TooltipContent>{action.hint}</TooltipContent>
          </Tooltip>
        )
      )}
    </div>
  )
}
