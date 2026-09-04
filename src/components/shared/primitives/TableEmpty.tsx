import { Inbox } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

type TableEmptyProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  // Truyền vào = dùng trong <TableBody renderEmptyState={() => <TableEmpty colSpan .../>}> — RAC
  // tự bọc kết quả trong <tr><td colSpan={số cột thật}>, TableEmpty chỉ còn quyết định style (giữ
  // header cột hiện — dùng cho bảng ở màn tạo/sửa/picker, nơi người dùng cần thấy tên cột để biết
  // cần nhập gì). Bỏ qua = thay nguyên bảng bằng card (dùng cho trang danh sách/chi tiết chỉ đọc).
  colSpan?: number
}

// Shared "no rows" state for every table in the app — built on shadcn's Empty primitive so every
// table's empty state shares một giao diện icon+tiêu đề+mô tả, dù thay nguyên bảng (colSpan không
// truyền) hay chỉ 1 dòng bên trong bảng (colSpan truyền vào, qua renderEmptyState).
export function TableEmpty({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  colSpan,
}: TableEmptyProps) {
  return (
    <Empty
      className={cn(
        colSpan ? "border-0 py-10" : "border border-border/70 bg-card",
        className
      )}
    >
      <EmptyHeader className="max-w-lg">
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle className={cn("capitalize", colSpan && "text-base")}>
          {title}
        </EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
