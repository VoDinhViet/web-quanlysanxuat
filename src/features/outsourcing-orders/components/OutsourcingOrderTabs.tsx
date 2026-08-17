import { Link } from "@tanstack/react-router"
import { Send, Upload } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { FileRouteTypes } from "@/routeTree.gen"

type TabItem = {
  label: string
  icon: LucideIcon
  href?: FileRouteTypes["to"]
}

// "Nhà cung cấp gia công"/"Báo cáo gia công ngoài" ngoài phạm vi giai đoạn này — bỏ khỏi tab
// strip. "Xuất đi gia công (OS-OUT)" có trang; "Nhập về (OS-IN)" chưa có href ở đây (dù đã có
// trang riêng ở /manage/outsourcing-receipts) nên vẫn giữ disabled, cùng "no page yet" idiom như
// AppSidebar's href-less menu items.
const tabs: TabItem[] = [
  {
    label: "Xuất đi gia công (OS-OUT)",
    icon: Send,
    href: "/manage/outsourcing-orders",
  },
  { label: "Nhập về (OS-IN)", icon: Upload },
]

export function OutsourcingOrderTabs() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-1">
        {tabs.map((tab) =>
          tab.href ? (
            <Link
              key={tab.label}
              to={tab.href}
              className="flex items-center gap-1.5 border-b-2 border-primary px-3 py-2.5 text-sm font-medium text-primary"
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          ) : (
            <Tooltip key={tab.label}>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="flex cursor-not-allowed items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </span>
              </TooltipTrigger>
              <TooltipContent>Tính năng sắp có</TooltipContent>
            </Tooltip>
          )
        )}
      </div>
    </TooltipProvider>
  )
}
