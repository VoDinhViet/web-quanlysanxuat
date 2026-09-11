import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  JobOperationReportDialog,
  resolveJobOperationReportDisabledReason,
} from "@/components/shared/composites/JobOperationReportDialog"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { OperationProgressBar } from "@/features/production-execution/components/primitives/OperationProgressBar"
import { OperationType } from "@/lib/types/operation.type"
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
      header: "Mã Part",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono font-medium text-foreground">
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.bomItem.name, {
      id: "name",
      header: "Tên chi tiết",
      meta: { headerClassName: "min-w-40" },
    }),
    columnHelper.accessor((row) => row.operation.plannedQuantity, {
      id: "plannedQuantity",
      header: "Kế hoạch (pcs)",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center tabular-nums font-medium",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    columnHelper.accessor((row) => row.operation.completedQuantity, {
      id: "completedQuantity",
      header: "Đã đạt (pcs)",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center tabular-nums font-semibold text-success",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    columnHelper.accessor((row) => row.operation.rejectedQuantity, {
      id: "rejectedQuantity",
      header: "Không đạt (pcs)",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center tabular-nums",
      },
      cell: ({ getValue }) => {
        const val = getValue()
        return (
          <span
            className={
              val > 0
                ? "font-semibold text-destructive"
                : "text-muted-foreground"
            }
          >
            {quantityFormatter.format(val)}
          </span>
        )
      },
    }),
    columnHelper.accessor(
      (row) =>
        Math.max(
          0,
          row.operation.plannedQuantity - row.operation.completedQuantity
        ),
      {
        id: "remainingQuantity",
        header: "Còn lại (pcs)",
        meta: {
          headerClassName: "min-w-28 text-center",
          cellClassName: "text-center tabular-nums font-medium",
        },
        cell: ({ getValue }) => quantityFormatter.format(getValue()),
      }
    ),
    columnHelper.accessor(
      (row) => ({
        planned: row.operation.plannedQuantity,
        completed: row.operation.completedQuantity,
      }),
      {
        id: "progress",
        header: "Tiến độ",
        meta: {
          headerClassName: "min-w-36 text-center",
          cellClassName: "text-center",
        },
        cell: ({ getValue }) => {
          const { planned, completed } = getValue()
          return (
            <OperationProgressBar
              plannedQuantity={planned}
              completedQuantity={completed}
              showCount={false}
              size="sm"
            />
          )
        },
      }
    ),
    columnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-36 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => {
        if (row.original.operation.type === OperationType.OUTSOURCE) {
          return null
        }

        const reason = resolveJobOperationReportDisabledReason(
          jobStatus,
          row.original.operation.type
        )

        return (
          <PermissionGate permission="production:update">
            <Tooltip>
              <TooltipTrigger
                render={
                  <JobOperationReportDialog
                    row={row.original}
                    disabledReason={reason}
                    trigger={
                      <Button type="button" size="sm">
                        Nhập báo cáo
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>
                {reason ??
                  "Nhập SL hoàn thành, ngày, ghi chú và ảnh cho Part này."}
              </TooltipContent>
            </Tooltip>
          </PermissionGate>
        )
      },
    }),
  ])
}
