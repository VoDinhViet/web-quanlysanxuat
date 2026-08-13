export function InventoryProductLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-blue-500" />
        <span className="font-semibold text-foreground">Tổng nhu cầu PO:</span>
        <span className="text-muted-foreground">
          Tổng số lượng các PO chưa giao liên quan đến thành phẩm
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-blue-500" />
        <span className="font-semibold text-foreground">Tồn thực tế:</span>
        <span className="text-muted-foreground">
          Tổng thành phẩm đã QC PASS nhưng chưa giao
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-amber-500" />
        <span className="font-semibold text-foreground">Đã giữ:</span>
        <span className="text-muted-foreground">
          Tổng SL đã đưa vào DO đã duyệt nhưng chưa xác nhận giao
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-emerald-500" />
        <span className="font-semibold text-foreground">Có thể xuất:</span>
        <span className="text-muted-foreground">Tồn thực tế - Đã giữ</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-rose-500" />
        <span className="font-semibold text-foreground">Tồn TP khả dụng:</span>
        <span className="text-muted-foreground">
          Tồn thực tế - Tổng nhu cầu PO
        </span>
      </div>
    </div>
  )
}
