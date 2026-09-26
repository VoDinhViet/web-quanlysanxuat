import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Eye, TrashBinTrash } from "@solar-icons/react"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteOperationDialog } from "@/features/operations/components/composites/DeleteOperationDialog"
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

type OperationColumnsOptions = {
  // Rows already paged past, so the "#" column keeps counting across pages.
  offset: number
}

// A factory, not a module constant: the "#" column depends on the current page. The caller
// memoizes the result.
export const buildOperationColumns = ({ offset }: OperationColumnsOptions) =>
  operationColumnHelper.columns([
    operationColumnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => offset + row.index + 1,
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
    }),
    operationColumnHelper.accessor("code", {
      header: "Mã công đoạn",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {getValue()}
        </span>
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
      cell: ({ getValue }) =>
        DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
      meta: { headerClassName: "min-w-28" },
    }),
    operationColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "font-normal",
      },
      cell: ({ row }) => {
        const operation = row.original

        return (
          <div className="flex items-center justify-center gap-1.5">
            <RoutePermissionGate route="/manage/operations/$operationId">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <LinkButton
                      to="/manage/operations/$operationId"
                      params={{ operationId: operation.id }}
                      variant="outline"
                      size="icon-sm"
                      aria-label="Xem chi tiết công đoạn"
                      className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                    >
                      <Eye className="size-3.5" />
                    </LinkButton>
                  }
                />
                <TooltipContent>Xem chi tiết</TooltipContent>
              </Tooltip>
            </RoutePermissionGate>
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
