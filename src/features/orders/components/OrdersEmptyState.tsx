import { ClipboardList, SearchX } from "lucide-react"

type OrdersEmptyStateProps = {
  /** True when a search/filter is active — the list is empty because nothing
   *  matched, not because no orders exist yet. */
  isFiltered: boolean
}

export function OrdersEmptyState({ isFiltered }: OrdersEmptyStateProps) {
  const Icon = isFiltered ? SearchX : ClipboardList

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        <Icon className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {isFiltered
            ? "Không tìm thấy đơn hàng phù hợp"
            : "Chưa có đơn hàng nào"}
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {isFiltered
            ? "Thử điều chỉnh từ khóa, khoảng ngày hoặc bộ lọc để xem thêm kết quả."
            : "Đơn hàng sẽ xuất hiện ở đây sau khi được tạo."}
        </p>
      </div>
    </div>
  )
}
