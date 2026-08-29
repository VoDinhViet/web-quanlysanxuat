import { Link, useLocation } from "@tanstack/react-router"
import { Send, Upload } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FileRouteTypes } from "@/routeTree.gen"

type TabItem = {
  label: string
  icon: LucideIcon
  href: FileRouteTypes["to"]
}

const tabs: TabItem[] = [
  {
    label: "Xuất đi gia công (OS-OUT)",
    icon: Send,
    href: "/manage/outsourcing-orders",
  },
  {
    label: "Nhập về (OS-IN)",
    icon: Upload,
    href: "/manage/outsourcing-receipts",
  },
]

// Nav strip chuyển giữa OS-OUT/OS-IN — dùng chung ở cả OutsourcingOrdersPage.tsx và
// OutsourcingReceiptsPage.tsx nên không thuộc riêng feature nào (xem "Layer boundaries" trong
// architecture.md), sống ở đây thay vì trong outsourcing-orders/components/.
export function OutsourcingTabs() {
  const { pathname } = useLocation()

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-1">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
