import { DateTime } from "luxon"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"

import {
  NcrStatusBadge,
  NcrTypeBadge,
} from "@/features/ncrs/components/primitives/NcrBadges"
import type { appTableFeatures } from "@/lib/table-features"
import type { Ncr } from "@/lib/types/ncr.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const ncrColumnHelper = createColumnHelper<typeof appTableFeatures, Ncr>()

export const ncrColumns = ncrColumnHelper.columns([
  ncrColumnHelper.accessor("code", {
    header: "Mã NCR",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <Link
        to="/manage/ncrs/$ncrId"
        params={{ ncrId: row.original.id }}
        className="font-mono text-xs font-medium text-primary hover:underline"
      >
        {row.original.code}
      </Link>
    ),
  }),

  ncrColumnHelper.accessor("type", {
    header: "Loại",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => <NcrTypeBadge type={getValue()} />,
  }),

  ncrColumnHelper.display({
    id: "item",
    header: "Sản phẩm",
    meta: { headerClassName: "min-w-48" },
    cell: ({ row }) => (
      <div className="max-w-72 min-w-0">
        <p className="line-clamp-2 text-sm font-medium break-words">
          {row.original.item.name}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {row.original.item.code}
        </p>
      </div>
    ),
  }),

  ncrColumnHelper.display({
    id: "source",
    header: "Nguồn",
    meta: { headerClassName: "min-w-36" },
    cell: ({ row }) => {
      const { client, order, productionJob } = row.original

      return (
        <div className="space-y-0.5 text-xs">
          {client && <p className="font-medium">{client.name}</p>}
          {order && (
            <p className="font-mono text-muted-foreground">SO {order.code}</p>
          )}
          {productionJob && (
            <p className="font-mono text-muted-foreground">
              Job {productionJob.code}
            </p>
          )}
          {!client && !order && !productionJob && "—"}
        </div>
      )
    },
  }),

  ncrColumnHelper.display({
    id: "department",
    header: "Bộ phận phát sinh",
    meta: { headerClassName: "min-w-36" },
    cell: ({ row }) => (
      <span className="text-xs">{row.original.department?.name ?? "—"}</span>
    ),
  }),

  ncrColumnHelper.accessor("ngQty", {
    header: "SL lỗi",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => (
      <span className="text-sm font-medium tabular-nums">
        {quantityFormatter.format(getValue())}
      </span>
    ),
  }),

  ncrColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => <NcrStatusBadge status={getValue()} />,
  }),

  ncrColumnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm")}
      </span>
    ),
  }),
])
