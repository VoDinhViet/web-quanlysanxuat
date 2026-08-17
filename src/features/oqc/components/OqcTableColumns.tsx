import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import {
  OqcResultBadge,
  OqcStatusBadge,
} from "@/features/oqc/components/OqcBadges"
import { OqcActionsCell } from "@/features/oqc/components/OqcTableCells"
import type { Oqc } from "@/lib/types/oqc.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const oqcColumnHelper = createColumnHelper<Oqc>()

export const oqcColumns = [
  oqcColumnHelper.accessor("code", {
    header: "Mã OQC",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),

  oqcColumnHelper.display({
    id: "item",
    header: "Vật tư",
    meta: { headerClassName: "min-w-48" },
    cell: ({ row }) => {
      const item = row.original.item

      return (
        <div className="max-w-56 min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {item.name}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {item.code}
          </p>
        </div>
      )
    },
  }),

  oqcColumnHelper.display({
    id: "jobAndOrder",
    header: "Job / PO",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => {
      const { productionJob, orderCode } = row.original

      return (
        <div className="min-w-0 text-xs">
          <p className="truncate font-mono font-medium text-foreground">
            {productionJob?.code ?? "—"}
          </p>
          <p className="truncate text-muted-foreground">{orderCode ?? "—"}</p>
        </div>
      )
    },
  }),

  oqcColumnHelper.display({
    id: "quantity",
    header: "SL (Lot size)",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => (
      <span className="font-semibold text-foreground tabular-nums">
        {quantityFormatter.format(row.original.quantity)}{" "}
        <span className="font-normal text-muted-foreground">
          {row.original.item.unit.name}
        </span>
      </span>
    ),
  }),

  oqcColumnHelper.accessor("inspectionDate", {
    header: "Ngày kiểm",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  oqcColumnHelper.accessor("result", {
    header: "Kết quả",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OqcResultBadge result={getValue()} />,
  }),

  oqcColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OqcStatusBadge status={getValue()} />,
  }),

  oqcColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <OqcActionsCell oqcId={row.original.id} />,
  }),
]
