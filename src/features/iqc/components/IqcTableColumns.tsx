import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import {
  IqcDispositionBadge,
  IqcResultBadge,
  IqcStatusBadge,
} from "@/features/iqc/components/IqcBadges"
import {
  IqcActionsCell,
  IqcPoOrReasonCell,
} from "@/features/iqc/components/IqcTableCells"
import type { Iqc } from "@/lib/types/iqc.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const iqcColumnHelper = createColumnHelper<Iqc>()

// Trimmed from the mockup's 14 columns to what's needed to scan the list at a glance — "#", "Mã
// NK" (now only a filter, see IqcTableFilter.tsx's "Mở rộng"), and "Ghi chú" dropped; mã/tên vật
// tư collapse into one "Vật tư" column, same identity-cell idiom as SupplierReturnsTableColumns.
export const iqcColumns = [
  iqcColumnHelper.accessor("code", {
    header: "Mã IQC",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),

  iqcColumnHelper.display({
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

  iqcColumnHelper.accessor((row) => row.supplier.name, {
    id: "supplier",
    header: "Nhà cung cấp",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => (
      <span className="block max-w-40 truncate">{getValue()}</span>
    ),
  }),

  iqcColumnHelper.display({
    id: "quantity",
    header: "Số lượng (ĐVT)",
    meta: {
      headerClassName: "min-w-32 text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => (
      <span className="font-semibold text-foreground tabular-nums">
        {quantityFormatter.format(row.original.quantity)}{" "}
        <span className="font-normal text-muted-foreground">
          ({row.original.item.unit.name})
        </span>
      </span>
    ),
  }),

  iqcColumnHelper.display({
    id: "poOrReason",
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <IqcPoOrReasonCell
        purchaseOrder={row.original.purchaseOrder}
        reason={row.original.reason}
      />
    ),
  }),

  iqcColumnHelper.accessor("inspectionDate", {
    header: "Ngày kiểm",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  iqcColumnHelper.accessor("result", {
    header: "Kết quả QC",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <IqcResultBadge result={getValue()} />,
  }),

  iqcColumnHelper.accessor("disposition", {
    header: "Quyết định xử lý",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const disposition = getValue()

      return disposition ? (
        <IqcDispositionBadge disposition={disposition} />
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )
    },
  }),

  iqcColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <IqcStatusBadge status={getValue()} />,
  }),

  iqcColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <IqcActionsCell iqcId={row.original.id} />,
  }),
]
