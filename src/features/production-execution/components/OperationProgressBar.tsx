import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OperationProgressBarProps = {
  plannedQuantity: number
  completedQuantity: number
  // Ẩn dòng "x/y pcs" phía trên thanh — dùng ở chỗ đã có 2 số đó hiện riêng rồi (tránh lặp).
  showCount?: boolean
  // "lg" — thanh dày hơn, dùng làm điểm nhấn đầu trang chi tiết Job (tổng tiến độ công đoạn);
  // "sm" (mặc định) — vừa 1 ô của bảng.
  size?: "sm" | "lg"
  className?: string
}

// Thanh tiến độ dùng chung cho bảng "DANH SÁCH CÔNG VIỆC" (list) và bảng "DANH SÁCH PART"
// (detail) — thay cho badge "Trạng thái" đơn thuần: cùng 1 lúc trả lời "đang ở đâu" (% + màu) và
// "còn bao nhiêu" (x/y pcs), từ đúng plannedQuantity/completedQuantity đã có sẵn trên
// ProductionJobByOperation/ProductionJobOperation — không suy diễn thêm dữ liệu nào. Màu suy
// thẳng từ tỉ lệ, không nhận status rời để không thể lệch giữa số hiển thị và màu tô.
export function OperationProgressBar({
  plannedQuantity,
  completedQuantity,
  showCount = true,
  size = "sm",
  className,
}: OperationProgressBarProps) {
  const ratio =
    plannedQuantity > 0 ? Math.min(completedQuantity / plannedQuantity, 1) : 0
  const percent = Math.round(ratio * 100)
  const isDone = plannedQuantity > 0 && completedQuantity >= plannedQuantity
  const isStarted = completedQuantity > 0

  const barColor = isDone
    ? "bg-success"
    : isStarted
      ? "bg-primary"
      : "bg-muted-foreground/25"
  const textColor = isDone
    ? "text-success"
    : isStarted
      ? "text-primary"
      : "text-muted-foreground"

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      {showCount && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {quantityFormatter.format(completedQuantity)} /{" "}
          {quantityFormatter.format(plannedQuantity)} pcs
        </span>
      )}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex-1 overflow-hidden rounded-full bg-muted",
            size === "lg" ? "h-2.5" : "h-1.5"
          )}
        >
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span
          className={cn(
            "shrink-0 text-right font-semibold tabular-nums",
            size === "lg" ? "w-10 text-sm" : "w-8 text-[11px]",
            textColor
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  )
}
