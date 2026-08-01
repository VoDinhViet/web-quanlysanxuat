import { Download, FileText, Logs, Pencil, Send, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

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

// Right column of the "Công đoạn sản xuất" tab: lists the actions this tab will eventually
// support and repeats the footer notes from the mockup. The old "Giải thích trạng thái" section
// explained status badges derived from planned/done/sent/received quantities — that data model
// doesn't exist on GET /production-jobs/:jobId/steps (see production-job.type.ts), so it's gone
// rather than explaining rules with nothing left to apply them to.
export function ProductionJobOperationsSidebar() {
  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-card">
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
