import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import type { CreateOutboundOrderItemValue } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const confirmColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  CreateOutboundOrderItemValue
>()

// Bảng chi tiết chỉ đọc của bước ③ — mirror cột của CreateOutboundOrderItemsColumns.tsx (item
// value chỉ giữ 5 field gửi BE, Order/Job/Item/Unit/SL đặt tra lại qua
// `lookupUnfulfilledOrderItem`, xem useUnfulfilledOrderItemLookup), nên giờ là 1 hàm build thay vì
// hằng module scope như trước — khác idiom CreateOutsourcingReceiptConfirmColumns.tsx (không cần
// tra cứu gì thêm nên vẫn là hằng).
export function buildCreateOutboundOrderConfirmColumns(
  lookupUnfulfilledOrderItem: (
    orderItemId: string
  ) => UnfulfilledOrderItem | undefined
) {
  return confirmColumnHelper.columns([
    confirmColumnHelper.display({
      id: "index",
      header: "STT",
      meta: {
        headerClassName: "w-10",
        cellClassName: "text-muted-foreground",
      },
      cell: ({ row }) => row.index + 1,
    }),
    confirmColumnHelper.display({
      id: "orderCode",
      header: "PO",
      meta: { headerClassName: "w-24" },
      cell: ({ row }) => {
        const source = lookupUnfulfilledOrderItem(row.original.orderItemId)
        if (!source) return "—"
        return (
          <Link
            to="/manage/orders/$orderId"
            params={{ orderId: source.order.id }}
            className="truncate font-mono text-xs text-primary hover:underline"
          >
            {source.order.code}
          </Link>
        )
      },
    }),
    confirmColumnHelper.display({
      id: "jobCode",
      header: "Job",
      meta: {
        headerClassName: "w-24",
        cellClassName: "truncate font-mono text-xs text-muted-foreground",
      },
      cell: ({ row }) =>
        lookupUnfulfilledOrderItem(row.original.orderItemId)?.job?.code ?? "—",
    }),
    confirmColumnHelper.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "w-44" },
      cell: ({ row }) => {
        const source = lookupUnfulfilledOrderItem(row.original.orderItemId)
        return (
          <div>
            <p className="truncate font-medium text-foreground">
              {source?.item.name ?? "—"}
            </p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {source?.item.code}
            </p>
          </div>
        )
      },
    }),
    confirmColumnHelper.display({
      id: "unitName",
      header: "ĐVT",
      meta: {
        headerClassName: "w-14",
        cellClassName: "text-muted-foreground",
      },
      cell: ({ row }) =>
        lookupUnfulfilledOrderItem(row.original.orderItemId)?.unit.name ?? "—",
    }),
    confirmColumnHelper.display({
      id: "orderedQuantity",
      header: "SL đặt",
      meta: {
        headerClassName: "w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row }) => {
        const orderedQuantity = lookupUnfulfilledOrderItem(
          row.original.orderItemId
        )?.orderedQuantity
        return orderedQuantity === undefined
          ? "—"
          : quantityFormatter.format(orderedQuantity)
      },
    }),
    confirmColumnHelper.accessor("quantity", {
      header: "SL giao",
      meta: {
        headerClassName: "w-20 text-right",
        cellClassName: "text-right tabular-nums",
      },
    }),
    confirmColumnHelper.accessor("note", {
      header: "Ghi chú",
      meta: {
        headerClassName: "w-40",
        cellClassName: "truncate text-muted-foreground",
      },
      cell: ({ getValue }) => getValue() || "—",
    }),
  ])
}
