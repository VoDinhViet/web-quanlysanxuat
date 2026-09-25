import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { PenNewSquare, Routing, TrashBinTrash } from "@solar-icons/react"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeleteOperationDialog } from "@/features/operations/components/composites/DeleteOperationDialog"
import { UpdateOperationDialog } from "@/features/operations/components/composites/UpdateOperationDialog"
import {
  operationStatusLabels,
  OperationStatus,
} from "@/lib/types/operation.type"
import type { OperationDetail } from "@/lib/types/operation.type"

const statusStyles: Record<OperationStatus, string> = {
  [OperationStatus.ACTIVE]: "bg-success/15 text-success",
  [OperationStatus.INACTIVE]: "bg-muted text-muted-foreground",
}

const operationColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  OperationDetail
>()

export const operationColumns = operationColumnHelper.columns([
  operationColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  operationColumnHelper.accessor("code", {
    header: "Mã công đoạn",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
          <Routing className="size-4" />
        </span>
        <span className="font-mono text-xs font-bold text-foreground">
          {getValue()}
        </span>
      </div>
    ),
  }),
  operationColumnHelper.accessor("name", {
    header: "Tên công đoạn",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  operationColumnHelper.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-52" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  operationColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge variant="outline" className={statusStyles[status]}>
          {operationStatusLabels[status]}
        </Badge>
      )
    },
  }),
  operationColumnHelper.accessor((row) => row.creatorBy?.fullName ?? "—", {
    id: "creator",
    header: "Người tạo",
    meta: { headerClassName: "min-w-32" },
  }),
  operationColumnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
    meta: { headerClassName: "min-w-28" },
  }),
  operationColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const operation = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <PermissionGate permission="operations:update">
            <Tooltip>
              <UpdateOperationDialog
                operation={operation}
                trigger={
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Chỉnh sửa"
                        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                      >
                        <PenNewSquare className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
          </PermissionGate>
          <PermissionGate permission="operations:delete">
            <Tooltip>
              <DeleteOperationDialog
                operation={operation}
                trigger={
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Xóa"
                        className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                      >
                        <TrashBinTrash className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>Xóa</TooltipContent>
            </Tooltip>
          </PermissionGate>
        </div>
      )
    },
  }),
])
