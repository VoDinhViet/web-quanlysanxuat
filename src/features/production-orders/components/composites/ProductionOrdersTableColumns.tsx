import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { ProductionOrderStatusBadge } from "@/features/production-orders/components/primitives/ProductionOrderBadges"
import {
  DueDateCell,
  ProductionOrderActionsCell,
} from "@/features/production-orders/components/primitives/ProductionOrderTableCells"
import type { ProductionOrder } from "@/lib/types/production-order.type"

const productionOrderColumnHelper = createColumnHelper<ProductionOrder>()

// No "Ngày tạo"/"Người tạo" columns — ProductionOrderResDto doesn't expose createdAt/creator.
export const productionOrderColumns = [
  productionOrderColumnHelper.accessor("orderCode", {
    header: "Số đơn hàng (SO)",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  productionOrderColumnHelper.accessor((row) => row.client?.name ?? "—", {
    id: "client",
    header: "Khách hàng",
    meta: { headerClassName: "min-w-44" },
  }),
  productionOrderColumnHelper.accessor("orderDate", {
    header: "Ngày đặt đơn",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  productionOrderColumnHelper.accessor("dueDate", {
    header: "Ngày giao",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <DueDateCell dueDate={getValue()} />,
  }),
  productionOrderColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <ProductionOrderStatusBadge tone={getValue()} />,
  }),
  productionOrderColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <ProductionOrderActionsCell row={row.original} />,
  }),
]
