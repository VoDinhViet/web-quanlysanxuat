import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"
import { Info } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { resolveFileUrl } from "@/lib/file-url"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Header có icon (i) giải thích khi hover thay vì rải chú thích thành văn bản choán chỗ trong
// bảng — cùng khuôn ColumnHeaderWithHint của CreateInventoryRequisitionPickerColumns.tsx, viết
// lại cục bộ (không import cross-feature) vì chỉ dùng trong orders.
function ColumnHeaderWithHint({
  label,
  hint,
}: {
  label: string
  hint: string
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <TooltipTrigger>
        <Info className="size-3 shrink-0 cursor-help text-muted-foreground/70" />
        <Tooltip>{hint}</Tooltip>
      </TooltipTrigger>
    </span>
  )
}

// Mỗi dòng bảng mang sẵn cờ isSelected đã tính (không tra cứu qua closure trong cell) — TanStack
// Table's row model chỉ chắc rebuild lại CELL khi `data` đổi tham chiếu, không phải khi riêng
// `columns` đổi. Gắn cờ này thẳng vào từng phần tử `data` (xem CreateOrderSelectItemsStep.tsx)
// buộc `data` đổi tham chiếu mỗi khi chọn/bỏ chọn, nên cell luôn build lại đúng — cùng bài học từ
// bug checkbox desync đã sửa ở phiên bản popup dialog trước đây (đã xoá).
export type SelectableProduct = ProductInventoryItem & {
  isSelected: boolean
}

const orderItemsSelectColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  SelectableProduct
>()

type BuildOrderItemsSelectColumnsArgs = {
  allChecked: boolean
  onToggleRow: (row: ProductInventoryItem) => void
  onToggleAll: (checked: boolean) => void
}

// Bảng danh mục sản phẩm dùng chung cho bước "Chọn sản phẩm" của cả 2 wizard Tạo/Sửa đơn hàng —
// tick chọn ĐÃ LÀ thêm thẳng vào `items` field-array của form (không còn khái niệm "đã có sẵn,
// khoá lại" như bản popup cũ: bỏ tick 1 dòng đang có trong đơn cũng chính là xoá dòng đó, không
// cần cơ chế chống trùng riêng nữa vì trạng thái tick phản ánh đúng 1-1 với field-array).
//
// `slot={null}` trên Checkbox: RAC's Table header row luôn bơm CheckboxContext dạng
// `{slots: {selection: checkboxProps}}` — KHÔNG có slot mặc định `""` như hàng thường, nên 1
// Checkbox không khai slot rõ sẽ crash "A slot prop is required" ngay ở header. Ta tự quản lý
// tick chọn qua isSelected/onToggleRow/onToggleAll (không dùng selectionMode của RAC Table).
export function buildOrderItemsSelectColumns({
  allChecked,
  onToggleRow,
  onToggleAll,
}: BuildOrderItemsSelectColumnsArgs) {
  return orderItemsSelectColumnHelper.columns([
    orderItemsSelectColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          slot={null}
          isSelected={allChecked}
          onChange={onToggleAll}
          aria-label="Chọn tất cả trang này"
        />
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <Checkbox
          slot={null}
          isSelected={row.original.isSelected}
          onChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.name}`}
        />
      ),
    }),
    orderItemsSelectColumnHelper.display({
      id: "product",
      header: "Sản phẩm",
      meta: { headerClassName: "min-w-72" },
      cell: ({ row }) => {
        const product = row.original

        return (
          <div className="flex min-w-0 items-center gap-3 py-1.5">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
              {product.image ? (
                <Image
                  src={resolveFileUrl(product.image.url)}
                  alt={product.name}
                  layout="fullWidth"
                  objectFit="cover"
                  className="size-full"
                />
              ) : (
                <Gallery className="size-5 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {product.name}
              </p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {product.code}
              </p>
            </div>
          </div>
        )
      },
    }),
    orderItemsSelectColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: {
        headerClassName: "min-w-16 text-center",
        cellClassName: "text-center",
      },
    }),
    orderItemsSelectColumnHelper.accessor("onHand", {
      header: () => (
        <ColumnHeaderWithHint
          label="Tồn kho"
          hint="Tồn thực tế: Σ nhập − Σ xuất trên các phiếu chưa xoá."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    orderItemsSelectColumnHelper.accessor("reserved", {
      header: () => (
        <ColumnHeaderWithHint
          label="Đã giữ"
          hint="Tổng SL các lệnh xuất hàng (DO) đang chờ duyệt/chờ giao."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    orderItemsSelectColumnHelper.accessor("available", {
      header: () => (
        <ColumnHeaderWithHint
          label="Khả dụng"
          hint="Tồn kho trừ Đã giữ và nhu cầu đơn hàng mở khác. Chỉ để tham khảo, có thể âm."
        />
      ),
      meta: { headerClassName: "min-w-20 text-right" },
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span
            className={
              value < 0
                ? "text-right text-xs text-destructive tabular-nums"
                : "text-right text-xs font-medium text-foreground tabular-nums"
            }
          >
            {quantityFormatter.format(value)}
          </span>
        )
      },
    }),
  ])
}
