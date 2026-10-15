import { createColumnHelper } from "@tanstack/react-table"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { RadioGroupItem } from "@/components/ui/radio-group"
import type { appTableFeatures } from "@/lib/table-features"
import { orderStatusLabels } from "@/lib/types/order.type"
import type { Order } from "@/lib/types/order.type"

const orderPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Order
>()

// Single-pick order table for the create-NCR page — scoped to the chosen product by the caller.
export function buildNcrOrderPickerColumns() {
  return orderPickerColumnHelper.columns([
    orderPickerColumnHelper.display({
      id: "select",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <RadioGroupItem
          value={row.original.id}
          aria-label={`Chọn đơn hàng ${row.original.code}`}
        />
      ),
    }),
    orderPickerColumnHelper.accessor("code", {
      header: "Mã đơn hàng",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="font-mono font-medium text-primary">{getValue()}</span>
      ),
    }),
    orderPickerColumnHelper.accessor((order) => order.buyerPoNo ?? "—", {
      id: "buyerPoNo",
      header: "PO",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "text-muted-foreground",
      },
    }),
    orderPickerColumnHelper.accessor((order) => order.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-36" },
    }),
    orderPickerColumnHelper.accessor("dueDate", {
      header: "Hạn giao",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center tabular-nums",
      },
      cell: ({ getValue }) => {
        const dueDate = getValue()
        return dueDate ? DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy") : "—"
      },
    }),
    orderPickerColumnHelper.accessor("status", {
      header: "Trạng thái",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => (
        <Badge variant="neutral">{orderStatusLabels[getValue()]}</Badge>
      ),
    }),
  ])
}
