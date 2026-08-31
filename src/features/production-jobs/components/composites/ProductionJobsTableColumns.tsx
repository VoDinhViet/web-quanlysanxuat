import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { ProductionJobStatusBadge } from "@/features/production-jobs/components/primitives/ProductionJobBadges"
import {
  ProductImageCell,
  ProductionJobActionsCell,
} from "@/features/production-jobs/components/primitives/ProductionJobTableCells"
import type { ProductionJob } from "@/lib/types/production-job.type"

const productionJobColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionJob
>()

// No "Mã SP"/"Tên sản phẩm" columns — ProductionJobResDto (list) dropped the nested `product`
// object 2026-07-31 in favor of a flat `image`, keeping only the columns the table needs (see
// production-job.type.ts). Those two columns aren't recoverable from this endpoint; the full
// product reference is only on GET /production-jobs/:jobId.
export const productionJobColumns = productionJobColumnHelper.columns([
  productionJobColumnHelper.display({
    id: "image",
    header: "",
    meta: { headerClassName: "w-14", cellClassName: "pr-0" },
    cell: ({ row }) => <ProductImageCell image={row.original.image} />,
  }),
  productionJobColumnHelper.accessor((row) => row.client?.name ?? "—", {
    id: "client",
    header: "KH",
    meta: { headerClassName: "min-w-36 pl-0" },
  }),
  productionJobColumnHelper.accessor("orderCode", {
    header: "PO",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  productionJobColumnHelper.accessor("code", {
    header: "JOB",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  productionJobColumnHelper.accessor("quantity", {
    header: "Qty (PO)",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center",
    },
  }),
  productionJobColumnHelper.accessor("orderDate", {
    header: "Ngày đặt hàng",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  productionJobColumnHelper.accessor("dueDate", {
    header: "Ngày giao hàng",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const dueDate = getValue()

      return dueDate === null
        ? "—"
        : DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")
    },
  }),
  productionJobColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <ProductionJobStatusBadge status={getValue()} />,
  }),
  productionJobColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <ProductionJobActionsCell productionJobId={row.original.id} />
    ),
  }),
])
