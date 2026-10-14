import { createColumnHelper } from "@tanstack/react-table"

import { PurchaseOrderItemProductCell } from "@/features/purchase-orders/components/primitives/PurchaseOrderItemProductCell"
import type { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"
import type { PurchaseOrderItemDetail } from "@/lib/types/purchase-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const priceFormatter = new Intl.NumberFormat("vi-VN")

const purchaseOrderItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseOrderItemDetail
>()

export function buildPurchaseOrderItemColumns(_editable?: boolean) {
  return purchaseOrderItemColumnHelper.columns([
    // Cột 1: STT
    purchaseOrderItemColumnHelper.display({
      id: "index",
      header: "STT",
      cell: ({ row }) => row.index + 1,
      meta: {
        headerClassName: "w-12 text-center text-xs",
        cellClassName: "text-center text-xs text-muted-foreground",
      },
    }),

    // Cột 2: Vật tư & Nguồn yêu cầu (ảnh + tên + mã vật tư + mã PR + ngày cần + ghi chú)
    purchaseOrderItemColumnHelper.display({
      id: "product",
      header: "Vật tư & Nguồn yêu cầu",
      meta: {
        headerClassName: "min-w-[260px] text-xs",
        cellClassName: "py-2.5",
      },
      cell: ({ row }) => <PurchaseOrderItemProductCell item={row.original} />,
    }),

    // Cột 3: Số lượng đặt & Tiến độ giao nhận (2 tầng thông tin gộp SL đặt, ĐVT NCC, đã nhận, còn lại)
    purchaseOrderItemColumnHelper.display({
      id: "quantityAndProgress",
      header: "Số lượng & Giao nhận",
      meta: {
        headerClassName: "w-56 text-right text-xs",
        cellClassName: "text-right py-2.5",
      },
      cell: ({ row }) => {
        const item = row.original
        const itemUnit = item.purchaseRequestItem.item.unit.name
        const isSupplierUnit =
          Boolean(item.quotationUnit?.trim()) &&
          item.quotationUnit?.trim().toLowerCase() !== itemUnit.trim().toLowerCase()

        const requested = item.purchaseRequestItem.quantity
        const ordered = item.quantity
        const received = item.receivedQuantity
        const remaining = Math.max(ordered - received, 0)
        const isCompleted = received >= ordered && ordered > 0

        return (
          <div className="space-y-1">
            {/* Tầng 1: Số lượng đặt (theo ĐVT gốc và ĐVT NCC nếu có) */}
            <div className="flex items-baseline justify-end gap-1.5 tabular-nums">
              <span className="font-semibold text-foreground text-xs">
                {quantityFormatter.format(ordered)} {itemUnit}
              </span>
              {isSupplierUnit && (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  ({quantityFormatter.format(item.quotationQuantity ?? 0)}{" "}
                  {item.quotationUnit})
                </span>
              )}
            </div>

            {/* Tầng 2: Tiến độ giao nhận + Ghi chú nếu SL đặt lệch SL yêu cầu */}
            <div className="flex flex-col items-end gap-0.5 text-[11px] tabular-nums">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "font-medium",
                    isCompleted
                      ? "text-success"
                      : received > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                  )}
                >
                  Nhận: {quantityFormatter.format(received)}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span
                  className={cn(
                    "font-medium",
                    remaining === 0
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  Còn: {quantityFormatter.format(remaining)}
                </span>
              </div>

              {requested !== ordered && (
                <span className="text-muted-foreground/75">
                  (Yêu cầu gốc: {quantityFormatter.format(requested)} {itemUnit})
                </span>
              )}
            </div>
          </div>
        )
      },
    }),

    // Cột 4: Đơn giá PO & Quy cách (2 tầng thông tin)
    purchaseOrderItemColumnHelper.display({
      id: "unitPriceAndSpec",
      header: "Đơn giá & Quy cách",
      meta: {
        headerClassName: "w-48 text-xs text-right",
        cellClassName: "text-right py-2.5",
      },
      cell: ({ row }) => {
        const item = row.original
        const unitPrice = item.unitPrice
        const itemUnit = item.purchaseRequestItem.item.unit.name
        const isSupplierUnit =
          Boolean(item.quotationUnit?.trim()) &&
          item.quotationUnit?.trim().toLowerCase() !== itemUnit.trim().toLowerCase()
        const quoteUnit = item.quotationUnit || itemUnit

        return (
          <div className="space-y-0.5">
            {/* Tầng 1: Đơn giá kèm ĐVT áp dụng */}
            <p className="font-semibold text-foreground tabular-nums text-xs">
              {unitPrice !== null && unitPrice !== undefined ? (
                <>
                  <span>{priceFormatter.format(unitPrice)} ₫</span>
                  <span className="text-[11px] font-normal text-muted-foreground ml-1">
                    / {quoteUnit}
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>

            {/* Tầng 2: Phân định ĐVT của NCC hay ĐVT gốc */}
            <p className="text-[11px] tabular-nums">
              {isSupplierUnit ? (
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <span>Theo ĐVT NCC:</span>
                  <strong>
                    {quantityFormatter.format(item.quotationQuantity ?? 0)}{" "}
                    {item.quotationUnit}
                  </strong>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Theo ĐVT gốc: {quantityFormatter.format(item.quantity)}{" "}
                  {itemUnit}
                </span>
              )}
            </p>
          </div>
        )
      },
    }),

    // Cột 5: Thành tiền quy đổi & Diễn giải cơ sở quy đổi
    purchaseOrderItemColumnHelper.display({
      id: "lineTotal",
      header: "Thành tiền quy đổi",
      meta: {
        headerClassName: "w-52 text-xs text-right",
        cellClassName: "text-right py-2.5",
      },
      cell: ({ row }) => {
        const item = row.original
        if (item.unitPrice === null || item.unitPrice === undefined) {
          return <span className="text-muted-foreground text-xs">—</span>
        }

        const itemUnit = item.purchaseRequestItem.item.unit.name
        const isSupplierUnit =
          Boolean(item.quotationUnit?.trim()) &&
          item.quotationUnit?.trim().toLowerCase() !== itemUnit.trim().toLowerCase()

        const effectiveQty = item.quotationQuantity ?? item.quantity
        const total = item.unitPrice * effectiveQty
        const quoteUnit = item.quotationUnit || itemUnit

        return (
          <div className="space-y-0.5">
            {/* Tầng 1: Tổng tiền nổi bật */}
            <p className="font-bold text-primary tabular-nums text-xs">
              {priceFormatter.format(total)} ₫
            </p>

            {/* Tầng 2: Diễn giải quy đổi chi tiết */}
            {isSupplierUnit ? (
              <div className="text-[10.5px] tabular-nums space-y-0.2">
                <p className="text-muted-foreground">
                  = {priceFormatter.format(item.unitPrice)} ×{" "}
                  {quantityFormatter.format(effectiveQty)} {quoteUnit}
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  (Quy đổi cho {quantityFormatter.format(item.quantity)}{" "}
                  {itemUnit} gốc)
                </p>
              </div>
            ) : (
              <div className="text-[10.5px] tabular-nums">
                <p className="text-muted-foreground">
                  = {priceFormatter.format(item.unitPrice)} ×{" "}
                  {quantityFormatter.format(effectiveQty)} {itemUnit}
                </p>
                <p className="text-muted-foreground/75">(Dựa trên ĐVT gốc)</p>
              </div>
            )}
          </div>
        )
      },
    }),
  ])
}
