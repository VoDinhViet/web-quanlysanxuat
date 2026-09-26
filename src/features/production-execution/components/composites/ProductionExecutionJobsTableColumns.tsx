import { DateTime } from "luxon"
import { formatJobOperationDueDate } from "@/components/shared/composites/JobOperationDueDateCell"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import {
  ProductionExecutionEvaluationBadge,
  ProductionExecutionImageCell,
  ProductionExecutionJobActionsCell,
  ProductionExecutionJobStatusBadge,
} from "@/features/production-execution/components/primitives/ProductionExecutionJobTableCells"
import type { ProductionJobByOperation } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const columnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionJobByOperation
>()

// Bảng "DANH SÁCH CÔNG VIỆC" — một dòng / (Job × công đoạn đang chọn). "Hạn hoàn thành"/"Đánh giá"/
// "Trạng thái" là của ĐÚNG công đoạn đang chọn (BE gộp qua mọi part), khác "Ngày giao" là hạn giao
// của cả đơn hàng.
export const productionExecutionJobColumns = columnHelper.columns([
  columnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  columnHelper.display({
    id: "image",
    header: "Hình ảnh",
    meta: { headerClassName: "w-20 text-center" },
    cell: ({ row }) => (
      <ProductionExecutionImageCell image={row.original.image} />
    ),
  }),
  columnHelper.accessor("orderCode", {
    header: "PO",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("jobCode", {
    header: "JOB",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  // Chỉ hiện khi xem "Tất cả công đoạn" (ProductionExecutionJobsTable ẩn/hiện qua columnVisibility).
  columnHelper.accessor("operationName", {
    id: "operation",
    header: "Công đoạn",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.item.code, {
    id: "itemCode",
    header: "Mã sản phẩm",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.item.name, {
    id: "itemName",
    header: "Tên sản phẩm",
    meta: { headerClassName: "min-w-40" },
  }),
  columnHelper.accessor("quantity", {
    header: "Số lượng",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center tabular-nums",
    },
    cell: ({ getValue }) => `${quantityFormatter.format(getValue())} pcs`,
  }),
  columnHelper.accessor("orderDate", {
    header: "Ngày đặt hàng",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  columnHelper.accessor("dueDate", {
    header: "Ngày giao",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => formatJobOperationDueDate(getValue()),
  }),
  columnHelper.accessor("operationDueDate", {
    header: "Hạn hoàn thành",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue, row }) => {
      return (
        <span
          className={
            row.original.operationStatus === "OVERDUE"
              ? "text-destructive"
              : undefined
          }
        >
          {formatJobOperationDueDate(getValue())}
        </span>
      )
    },
  }),
  columnHelper.accessor("operationEvaluation", {
    header: "Đánh giá",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <ProductionExecutionEvaluationBadge evaluation={getValue()} />
    ),
  }),
  columnHelper.accessor("operationStatus", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <ProductionExecutionJobStatusBadge status={getValue()} />
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => (
      <ProductionExecutionJobActionsCell
        productionJobId={row.original.jobId}
        operationId={row.original.operationId}
      />
    ),
  }),
])
