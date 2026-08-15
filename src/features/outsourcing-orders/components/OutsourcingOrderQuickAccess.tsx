import { BarChart3, Send, Upload, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type QuickAccessTile = {
  label: string
  description: string
  icon: LucideIcon
  accentClassName: string
  tileClassName: string
}

const QUICK_ACCESS_TILES: QuickAccessTile[] = [
  {
    label: "Tạo phiếu OS-OUT",
    description: "Tạo phiếu xuất đi gia công ngoài cho NCC.",
    icon: Send,
    accentClassName: "text-blue-600 dark:text-blue-400",
    tileClassName:
      "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-500/10 dark:hover:bg-blue-500/20",
  },
  {
    label: "Nhập hàng về (OS-IN)",
    description: "Nhập hàng gia công về và ghi nhận số lượng thực tế.",
    icon: Upload,
    accentClassName: "text-emerald-600 dark:text-emerald-400",
    tileClassName:
      "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
  },
  {
    label: "Nhà cung cấp gia công",
    description: "Quản lý danh sách nhà cung cấp gia công.",
    icon: Users,
    accentClassName: "text-violet-600 dark:text-violet-400",
    tileClassName:
      "border-violet-200 bg-violet-50 hover:bg-violet-100 dark:border-violet-800/40 dark:bg-violet-500/10 dark:hover:bg-violet-500/20",
  },
  {
    label: "Báo cáo gia công ngoài",
    description: "Xem báo cáo thống kê theo thời gian, NCC...",
    icon: BarChart3,
    accentClassName: "text-amber-600 dark:text-amber-400",
    tileClassName:
      "border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-500/10 dark:hover:bg-amber-500/20",
  },
]

// "Truy cập nhanh" strip — same tile idiom as ManageQuickActions.tsx (dashboard), sized for 4
// items instead of that page's grid-cols-3. None of these routes exist yet (this pass only
// builds the OS-OUT list tab), so every tile stays a disabled, non-interactive preview instead
// of a dead Link.
export function OutsourcingOrderQuickAccess() {
  return (
    <section className="rounded-lg bg-card px-4 py-4 shadow-card lg:px-5">
      <h2 className="text-xs font-semibold tracking-wide text-foreground uppercase">
        Truy cập nhanh
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACCESS_TILES.map((tile) => (
          <Button
            key={tile.label}
            type="button"
            variant="outline"
            disabled
            className={cn(
              "h-auto flex-col items-start gap-1 px-3.5 py-3.5 text-left whitespace-normal disabled:opacity-100",
              tile.tileClassName
            )}
          >
            <tile.icon className={cn("size-5", tile.accentClassName)} />
            <span className={cn("text-xs font-semibold", tile.accentClassName)}>
              {tile.label}
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {tile.description}
            </span>
          </Button>
        ))}
      </div>
    </section>
  )
}
