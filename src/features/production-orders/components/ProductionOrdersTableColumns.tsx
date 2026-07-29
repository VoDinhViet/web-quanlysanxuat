import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { ProductionOrderStatusBadge } from "@/features/production-orders/components/ProductionOrderBadges"
import {
  DueDateCell,
  ProductionOrderActionsCell,
} from "@/features/production-orders/components/ProductionOrderTableCells"
import { resolveProductionOrderStatus } from "@/lib/types/production-order.type"
import type { Order } from "@/lib/types/order.type"

const productionOrderColumnHelper = createColumnHelper<Order>()

export const productionOrderColumns = [
  productionOrderColumnHelper.accessor("code", {
    header: "Số đơn hàng (SO)",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  productionOrderColumnHelper.accessor((row) => row.client.name, {
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
    cell: ({ row }) => <DueDateCell order={row.original} />,
  }),
  productionOrderColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <ProductionOrderStatusBadge
        tone={resolveProductionOrderStatus(getValue())}
      />
    ),
  }),
  productionOrderColumnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),
  productionOrderColumnHelper.accessor((row) => row.creator?.username ?? "—", {
    id: "creator",
    header: "Người tạo",
    meta: { headerClassName: "min-w-28" },
  }),
  productionOrderColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <ProductionOrderActionsCell order={row.original} />,
  }),
]
