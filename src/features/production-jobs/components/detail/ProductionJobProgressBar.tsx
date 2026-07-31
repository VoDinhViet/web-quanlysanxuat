import { cn } from "@/lib/utils"

type ProductionJobProgressBarProps = {
  percent: number
  className?: string
}

// Thanh tiến độ mảnh dùng chung cho mọi chỗ có tỉ lệ "đã làm/kế hoạch" trên trang chi tiết Job
// (BOM vật tư, Công đoạn nội bộ, Gia công ngoài) — cùng một ngôn ngữ hình ảnh thay vì mỗi bảng tự
// vẽ lại (đã lặp ở 3 nơi, qua ngưỡng "3rd use" nên tách riêng).
export function ProductionJobProgressBar({
  percent,
  className,
}: ProductionJobProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width]",
          clamped >= 100 ? "bg-emerald-500" : "bg-primary"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
