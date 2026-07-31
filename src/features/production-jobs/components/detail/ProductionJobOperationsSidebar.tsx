import {
  Download,
  FileText,
  Info,
  Logs,
  Pencil,
  Send,
  Settings,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  OUTSOURCE_STEP_STATUS_LABELS,
  OutsourceStepStatus,
  PRODUCTION_STEP_STATUS_LABELS,
  ProductionStepStatus,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

// Cùng idiom InfoSection của ProductionJobInfoTab.tsx (tab "Thông tin chung") — một khối nền
// duy nhất, các mục con tách nhau bằng đường kẻ (`not-first:border-t`) thay vì mỗi mục một
// Surface/card viền+bóng riêng.
function SidebarSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <div className="not-first:border-t not-first:border-border">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Icon className="size-3.5 text-muted-foreground" />
        {title}
      </h3>
      <div className="p-4">{children}</div>
    </div>
  )
}

type StatusRuleGroup = {
  groupLabel: string
  rules: { dotClassName: string; label: string; condition: string }[]
}

// Copy đọc thẳng từ 2 label map dùng chung với các badge trạng thái (ProductionJobStepBadges.tsx)
// — chỉ phần "condition" là văn bản diễn giải riêng cho khối này.
const STATUS_RULE_GROUPS: StatusRuleGroup[] = [
  {
    groupLabel: "Công đoạn nội bộ",
    rules: [
      {
        dotClassName: "bg-muted-foreground/50",
        label: PRODUCTION_STEP_STATUS_LABELS[ProductionStepStatus.NOT_STARTED],
        condition: "SL hoàn thành = 0",
      },
      {
        dotClassName: "bg-amber-500 dark:bg-amber-400",
        label: PRODUCTION_STEP_STATUS_LABELS[ProductionStepStatus.IN_PROGRESS],
        condition: "0 < SL hoàn thành < SL kế hoạch",
      },
      {
        dotClassName: "bg-emerald-500 dark:bg-emerald-400",
        label: PRODUCTION_STEP_STATUS_LABELS[ProductionStepStatus.DONE],
        condition: "SL hoàn thành ≥ SL kế hoạch",
      },
    ],
  },
  {
    groupLabel: "Gia công ngoài",
    rules: [
      {
        dotClassName: "bg-muted-foreground/50",
        label: OUTSOURCE_STEP_STATUS_LABELS[OutsourceStepStatus.NOT_SENT],
        condition: "Đã gửi = 0",
      },
      {
        dotClassName: "bg-amber-500 dark:bg-amber-400",
        label: OUTSOURCE_STEP_STATUS_LABELS[OutsourceStepStatus.IN_PROGRESS],
        condition: "Đã gửi > Đã nhận",
      },
      {
        dotClassName: "bg-emerald-500 dark:bg-emerald-400",
        label: OUTSOURCE_STEP_STATUS_LABELS[OutsourceStepStatus.DONE],
        condition: "Đã nhận ≥ SL kế hoạch",
      },
    ],
  },
]

const ACTION_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Pencil, label: "Cập nhật số lượng hoàn thành (nội bộ)" },
  { icon: Logs, label: "Xem lịch sử cập nhật" },
  { icon: Send, label: "Gửi đi gia công ngoài" },
  { icon: Download, label: "Cập nhật số lượng nhận về (gia công ngoài)" },
]

const NOTE_ITEMS = [
  "SL kế hoạch được lấy từ cấu trúc sản phẩm khi tạo Job.",
  "SL hoàn thành là số lượng thực tế đã hoàn thành tại xưởng.",
  "Với gia công ngoài: chỉ theo dõi số lượng đã gửi và đã nhận.",
  "Có thể gửi/nhận nhiều lần, hệ thống tự động cộng dồn.",
]

// Right column of the "Công đoạn sản xuất" tab: explains the two status badges rendered in the
// table, lists the actions this tab will eventually support, and repeats the footer notes from
// the mockup.
export function ProductionJobOperationsSidebar() {
  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-card">
      <SidebarSection title="Giải thích trạng thái" icon={Info}>
        <div className="space-y-4">
          {STATUS_RULE_GROUPS.map((group) => (
            <div key={group.groupLabel}>
              <p className="mb-2 text-xs font-semibold text-foreground">
                {group.groupLabel}
              </p>
              <ul className="space-y-1.5">
                {group.rules.map((rule) => (
                  <li
                    key={rule.label}
                    className="flex items-baseline gap-2 text-xs"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 translate-y-[1px] rounded-full",
                        rule.dotClassName
                      )}
                    />
                    <span className="text-foreground">
                      <span className="font-medium">{rule.label}:</span>{" "}
                      <span className="text-muted-foreground">
                        {rule.condition}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection title="Chức năng thao tác" icon={Settings}>
        <ul className="space-y-2.5">
          {ACTION_ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <item.icon className="size-3.5 shrink-0 text-muted-foreground" />
              {item.label}
            </li>
          ))}
        </ul>
      </SidebarSection>

      <SidebarSection title="Ghi chú" icon={FileText}>
        <ul className="space-y-1.5">
          {NOTE_ITEMS.map((note) => (
            <li
              key={note}
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
              {note}
            </li>
          ))}
        </ul>
      </SidebarSection>
    </div>
  )
}
