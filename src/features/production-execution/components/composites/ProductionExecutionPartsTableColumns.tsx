import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import {
  JobOperationReportDialog,
  resolveJobOperationReportDisabledReason,
} from "@/components/shared/composites/JobOperationReportDialog"
import type {
  JobOperationReportRow,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const columnHelper = createColumnHelper<
  typeof appTableFeatures,
  JobOperationReportRow
>()

type BuildColumnsArgs = {
  // Trạng thái Job — dialog tự gộp với loại công đoạn (OUTSOURCE) để tính lý do khoá, xem
  // resolveJobOperationReportDisabledReason (JobOperationReportDialog.tsx). Giống nhau cho mọi
  // dòng của cùng 1 Job nên truyền 1 lần vào đây, không tính lại mỗi dòng.
  jobStatus: ProductionJobStatus
}

// Xây động (không phải mảng module-scope) vì "Thao tác" cần đóng gói `jobStatus` — gọi qua
// `useMemo` ở ProductionExecutionPartsTable.tsx, đúng ngoại lệ forms-and-ui.md cho phép ("module
// scope hoặc memoized với useMemo").
export function buildProductionExecutionPartColumns({
  jobStatus,
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
      cell: ({ row }) => {
        const reason = resolveJobOperationReportDisabledReason(
          jobStatus,
          row.original.operation.type
        )

        return (
          <TooltipTrigger>
            <JobOperationReportDialog
              row={row.original}
              disabledReason={reason}
              trigger={
                <Button type="button" size="sm">
                  Nhập báo cáo
                </Button>
              }
            />
            <Tooltip>
              {reason ??
                "Nhập SL hoàn thành, ngày, ghi chú và ảnh cho Part này."}
            </Tooltip>
          </TooltipTrigger>
        )
      },
    }),
  ])
}
