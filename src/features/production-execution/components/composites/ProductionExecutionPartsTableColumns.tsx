import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { JobOperationReportDialog } from "@/features/production-execution/components/composites/JobOperationReportDialog"
import type {
  ProductionJobBomItem,
  ProductionJobOperation,
} from "@/lib/types/production-job.type"

// Một dòng của bảng "DANH SÁCH PART" — Part (BOM item) ghép với đúng công đoạn đang chọn của nó
// (đã lọc sẵn ở ProductionExecutionJobPage.tsx, xem C1 trong kế hoạch: GET .../operations trả mọi
// công đoạn của mỗi part, không riêng công đoạn đang chọn).
export type ProductionExecutionPartRow = {
  bomItem: ProductionJobBomItem
  operation: ProductionJobOperation
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const columnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionExecutionPartRow
>()

type BuildColumnsArgs = {
  // null = có thể báo cáo; ngược lại là lý do bị khoá — dialog tự hiện lý do này thay vì để bấm
  // xong mới báo lỗi từ BE (xem JobOperationReportForm.tsx). Giống nhau cho mọi dòng của cùng 1 Job
  // nên truyền 1 lần vào đây, không tính lại mỗi dòng.
  disabledReason: string | null
}

// Xây động (không phải mảng module-scope) vì "Thao tác" cần đóng gói `disabledReason` — gọi qua
// `useMemo` ở ProductionExecutionPartsTable.tsx, đúng ngoại lệ forms-and-ui.md cho phép ("module
// scope hoặc memoized với useMemo").
export function buildProductionExecutionPartColumns({
  disabledReason,
}: BuildColumnsArgs) {
  return columnHelper.columns([
    columnHelper.accessor((row) => row.bomItem.code, {
      id: "code",
      header: "Part",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.bomItem.name, {
      id: "name",
      header: "Tên chi tiết",
      meta: { headerClassName: "min-w-40" },
    }),
    columnHelper.accessor((row) => row.operation.plannedQuantity, {
      id: "plannedQuantity",
      header: "Định mức (pcs)",
      meta: {
        headerClassName: "min-w-24 text-center",
        cellClassName: "text-center tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    columnHelper.accessor((row) => row.operation.completedQuantity, {
      id: "completedQuantity",
      header: "Hoàn thành (pcs)",
      meta: {
        headerClassName: "min-w-24 text-center",
        cellClassName: "text-center tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    columnHelper.accessor(
      (row) =>
        row.operation.plannedQuantity -
        row.operation.completedQuantity -
        row.operation.rejectedQuantity,
      {
        id: "remainingQuantity",
        header: "Còn lại (pcs)",
        meta: {
          headerClassName: "min-w-24 text-center",
          cellClassName: "text-center tabular-nums",
        },
        cell: ({ getValue }) => quantityFormatter.format(getValue()),
      }
    ),
    columnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-40 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <Tooltip>
          <JobOperationReportDialog
            partRow={row.original}
            disabledReason={disabledReason}
            trigger={
              <TooltipTrigger asChild>
                <Button type="button" size="sm">
                  Nhập báo cáo
                </Button>
              </TooltipTrigger>
            }
          />
          <TooltipContent>
            {disabledReason ??
              "Nhập SL hoàn thành, ngày, ghi chú và ảnh cho Part này."}
          </TooltipContent>
        </Tooltip>
      ),
    }),
  ])
}
