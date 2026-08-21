import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import {
  OqcDispositionBadge,
  OqcResultBadge,
  OqcStatusBadge,
} from "@/features/oqc/components/OqcBadges"
import { OqcActionsCell } from "@/features/oqc/components/OqcTableCells"
import type { Oqc } from "@/lib/types/oqc.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const oqcColumnHelper = createColumnHelper<Oqc>()

// Thứ tự cột theo đúng spec nghiệp vụ: Mã OQC | PO | Job | Công đoạn | Mã part | Tên Part | Đvt |
// Lot size | Kết quả | Phương án xử lý | Ngày KT | Trạng thái | Ghi chú | Thao tác. "Công đoạn"
// nằm ngoài spec liệt kê — thêm vì OQC giờ per-operation (1 part có thể nhiều công đoạn, thiếu cột
// này 2 dòng cùng part khác công đoạn nhìn giống hệt nhau). "Mã part"/"Tên Part" đọc từ `bomItem`
// (snapshot BOM của Job) chứ không phải `item` sống — Đvt đọc từ `unit`, field ngang hàng `item`
// (không lồng trong `item` như IQC), `item` hiện không cột nào hiển thị.
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

  oqcColumnHelper.accessor("orderCode", {
    header: "PO",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {getValue() ?? "—"}
      </span>
    ),
  }),

  oqcColumnHelper.accessor((row) => row.productionJob.code, {
    id: "job",
    header: "Job",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-medium text-foreground">
        {getValue()}
      </span>
    ),
  }),

  oqcColumnHelper.accessor((row) => row.operation.name, {
    id: "operation",
    header: "Công đoạn",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <div className="max-w-40 min-w-0">
        <p className="truncate text-xs text-foreground">
          {row.original.operation.name}
        </p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {row.original.operation.code}
        </p>
      </div>
    ),
  }),

  oqcColumnHelper.accessor((row) => row.bomItem.code, {
    id: "bomItemCode",
    header: "Mã part",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-foreground">{getValue()}</span>
    ),
  }),

  oqcColumnHelper.accessor((row) => row.bomItem.name, {
    id: "bomItemName",
    header: "Tên Part",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <span className="line-clamp-2 text-xs text-foreground">{getValue()}</span>
    ),
  }),

  oqcColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "Đvt",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{getValue()}</span>
    ),
  }),

  oqcColumnHelper.accessor("quantity", {
    header: "Lot size",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => (
      <span className="font-semibold text-foreground tabular-nums">
        {quantityFormatter.format(getValue())}
      </span>
    ),
  }),

  oqcColumnHelper.accessor("result", {
    header: "Kết quả",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OqcResultBadge result={getValue()} />,
  }),

  oqcColumnHelper.accessor("disposition", {
    header: "Phương án xử lý",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const disposition = getValue()

      return disposition ? (
        <OqcDispositionBadge disposition={disposition} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )
    },
  }),

  oqcColumnHelper.accessor("inspectionDate", {
    header: "Ngày KT",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  oqcColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OqcStatusBadge status={getValue()} />,
  }),

  oqcColumnHelper.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => {
      const note = getValue()

      return (
        <span
          className="line-clamp-2 text-xs text-muted-foreground"
          title={note ?? undefined}
        >
          {note ?? "—"}
        </span>
      )
    },
  }),

  oqcColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <OqcActionsCell oqc={row.original} />,
  }),
]
