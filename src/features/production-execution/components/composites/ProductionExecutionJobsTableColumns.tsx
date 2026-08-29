import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import { Box } from "lucide-react"

import { ProductionExecutionJobActionsCell } from "@/features/production-execution/components/primitives/ProductionExecutionJobTableCells"
import { OperationProgressBar } from "@/features/production-execution/components/primitives/OperationProgressBar"
import type { ProductionJobByOperation } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const columnHelper = createColumnHelper<ProductionJobByOperation>()

// Bảng "DANH SÁCH CÔNG VIỆC" — cột "Tiến độ" thay hẳn badge "Trạng thái" cũ: cùng lúc trả lời
// "đang ở đâu" (thanh + %) và "còn bao nhiêu" (x/y pcs), đọc thẳng plannedQuantity/
// completedQuantity đã có trên ProductionJobByOperation (số của ĐÚNG công đoạn đang chọn, gộp qua
// mọi part — khác `quantity`, là SL thành phẩm của cả Job). Cột icon đầu dòng chỉ trang trí (data
// hiện chưa có ảnh sản phẩm ở endpoint này) — dùng 1 icon trung tính, không suy diễn hình thật.
export const productionExecutionJobColumns = [
  columnHelper.display({
    id: "icon",
    header: "",
    meta: { headerClassName: "w-10", cellClassName: "pr-0" },
    cell: () => (
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Box className="size-4" />
      </span>
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
  columnHelper.accessor((row) => row.item.code, {
    id: "itemCode",
    header: "Mã SP",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.item.name, {
    id: "itemName",
    header: "Tên sản phẩm",
    meta: { headerClassName: "min-w-40" },
  }),
  columnHelper.accessor("quantity", {
    header: "SL (pcs)",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
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
  columnHelper.display({
    id: "progress",
    header: "Tiến độ",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <OperationProgressBar
        plannedQuantity={row.original.plannedQuantity}
        completedQuantity={row.original.completedQuantity}
      />
    ),
  }),
  columnHelper.accessor("operationCompletedDate", {
    header: "Ngày hoàn thành CĐ",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const completedDate = getValue()
      return completedDate === null
        ? "—"
        : DateTime.fromISO(completedDate).toFormat("dd/MM/yyyy")
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => (
      <ProductionExecutionJobActionsCell productionJobId={row.original.jobId} />
    ),
  }),
]
