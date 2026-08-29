import { Link } from "@tanstack/react-router"
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

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { cn } from "@/lib/utils"
import type { ManageRoutePath } from "@/lib/route-permissions"

type QuickAction = {
  label: string
  icon: ComponentType<IconProps>
  accentClassName: string
  tileClassName: string
} & (
  | { to: ManageRoutePath; hint?: undefined }
  | { to?: undefined; hint: string }
)

const tileClassName =
  "h-auto flex-col gap-1.5 px-2 py-4 text-center text-[11px] whitespace-normal"

const quickActions: QuickAction[] = [
  {
    label: "Tạo LSX (Job)",
    icon: ClipboardAdd,
    accentClassName: "text-emerald-600 dark:text-emerald-400",
    tileClassName:
      "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
    hint: "LSX được tạo tự động khi duyệt LSX từ đơn hàng — chưa có form tạo tay",
  },
  {
    label: "Tạo DO",
    icon: InboxOut,
    accentClassName: "text-blue-600 dark:text-blue-400",
    tileClassName:
      "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-500/10 dark:hover:bg-blue-500/20",
    to: "/manage/outbound-orders/create",
  },
  {
    label: "Tạo NCR",
    icon: DocumentAdd,
    accentClassName: "text-red-600 dark:text-red-400",
    tileClassName:
      "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800/40 dark:bg-red-500/10 dark:hover:bg-red-500/20",
    hint: "Chưa có phân hệ NCR riêng — xem docs/domains/quality.md",
  },
  {
    label: "Đề xuất mua",
    icon: CartLarge2,
    accentClassName: "text-amber-600 dark:text-amber-400",
    tileClassName:
      "border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-500/10 dark:hover:bg-amber-500/20",
    to: "/manage/purchase-requests/create",
  },
  {
    label: "Nhập OS về",
    icon: InboxIn,
    accentClassName: "text-indigo-600 dark:text-indigo-400",
    tileClassName:
      "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
    to: "/manage/outsourcing-receipts/create",
  },
  {
    label: "Nhập kho",
    icon: Box,
    accentClassName: "text-teal-600 dark:text-teal-400",
    tileClassName:
      "border-teal-200 bg-teal-50 hover:bg-teal-100 dark:border-teal-800/40 dark:bg-teal-500/10 dark:hover:bg-teal-500/20",
    to: "/manage/inventory-receipts/create",
  },
  {
    label: "Xuất kho",
    icon: Buildings2,
    accentClassName: "text-cyan-600 dark:text-cyan-400",
    tileClassName:
      "border-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:border-cyan-800/40 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20",
    hint: "Xuất vật tư/thành phẩm khỏi kho hiện chưa có form tạo tay riêng",
  },
  {
    label: "Báo giá (RFQ)",
    icon: BillList,
    accentClassName: "text-violet-600 dark:text-violet-400",
    tileClassName:
      "border-violet-200 bg-violet-50 hover:bg-violet-100 dark:border-violet-800/40 dark:bg-violet-500/10 dark:hover:bg-violet-500/20",
    to: "/manage/purchase-quotations/create",
  },
  {
    label: "PO mua hàng",
    icon: Bag4,
    accentClassName: "text-slate-600 dark:text-slate-400",
    tileClassName:
      "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700/40 dark:bg-slate-500/10 dark:hover:bg-slate-500/20",
    to: "/manage/purchase-orders/create",
  },
]

export function ManageQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickActions.map((action) =>
        action.to ? (
          <RoutePermissionGate key={action.label} route={action.to}>
            <Button
              asChild
              type="button"
              variant="outline"
              className={cn(tileClassName, action.tileClassName)}
            >
              <Link to={action.to}>
                <action.icon className={cn("size-6", action.accentClassName)} />
                <span className={action.accentClassName}>{action.label}</span>
              </Link>
            </Button>
          </RoutePermissionGate>
        ) : (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className={cn(
                    tileClassName,
                    "pointer-events-none w-full",
                    action.tileClassName
                  )}
                >
                  <action.icon
                    className={cn("size-6", action.accentClassName)}
                  />
                  <span className={action.accentClassName}>{action.label}</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{action.hint}</TooltipContent>
          </Tooltip>
        )
      )}
    </div>
  )
}
