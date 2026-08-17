import { Link } from "@tanstack/react-router"
import { BarChart3, Send, Upload, Users } from "lucide-react"
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

// Only "Xuất đi gia công (OS-OUT)" has a page so far — the other 3 stay disabled with a tooltip,
// same "no page yet" idiom as AppSidebar's href-less menu items, rendered as a tab strip instead
// of a real Tabs state machine since there's only one panel to show right now.
const tabs: TabItem[] = [
  {
    label: "Xuất đi gia công (OS-OUT)",
    icon: Send,
    href: "/manage/outsourcing-orders",
  },
  { label: "Nhập về (OS-IN)", icon: Upload },
  { label: "Nhà cung cấp gia công", icon: Users },
  { label: "Báo cáo gia công ngoài", icon: BarChart3 },
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
