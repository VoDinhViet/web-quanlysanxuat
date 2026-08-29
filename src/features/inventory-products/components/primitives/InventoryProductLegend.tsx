export function InventoryProductLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-blue-500" />
        <span className="font-semibold text-foreground">Tồn thực tế:</span>
        <span className="text-muted-foreground">
          Σ nhập kho - Σ xuất kho trên các phiếu chưa xoá
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-amber-500" />
        <span className="font-semibold text-foreground">Đã giữ:</span>
        <span className="text-muted-foreground">
          Σ SL trên lệnh xuất hàng (DO) đang chờ duyệt/chờ giao
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-rose-500" />
        <span className="font-semibold text-foreground">Tồn TP khả dụng:</span>
        <span className="text-muted-foreground">
          Tồn thực tế - Đã giữ - Nhu cầu chưa có DO nào giữ
        </span>
      </div>
    </div>
  )
}
