import { PenNewSquare, TrashBinTrash } from "@solar-icons/react"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { unitTypeStyles } from "@/features/units/constants/unit-type-styles"
import { DeleteUnitDialog } from "@/features/units/components/composites/DeleteUnitDialog"
import { UpdateUnitDialog } from "@/features/units/components/composites/UpdateUnitDialog"
import {
  UnitStatus,
  unitStatusLabels,
  unitTypeLabels,
} from "@/lib/types/unit.type"
import type { UnitDetail } from "@/lib/types/unit.type"
import { cn } from "@/lib/utils"

const statusStyles: Record<UnitStatus, string> = {
  [UnitStatus.ACTIVE]: "bg-success/15 text-success",
  [UnitStatus.INACTIVE]: "bg-muted text-muted-foreground",
}

const unitColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  UnitDetail
>()

export const unitColumns = unitColumnHelper.columns([
  unitColumnHelper.accessor("code", {
    header: "Mã đơn vị",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row, getValue }) => {
      const TypeIcon = unitTypeStyles[row.original.type].icon

      return (
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              unitTypeStyles[row.original.type].tile
            )}
          >
            <TypeIcon className="size-4" />
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            {getValue()}
          </span>
        </div>
      )
    },
  }),
  unitColumnHelper.accessor("name", {
    header: "Tên đơn vị",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  unitColumnHelper.accessor("type", {
    header: "Loại",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <Badge variant="outline" className="gap-1.5 font-medium text-foreground">
        <span
          className={cn(
            "size-1.5 rounded-full",
            unitTypeStyles[getValue()].dot
          )}
        />
        {unitTypeLabels[getValue()]}
      </Badge>
    ),
  }),
  unitColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge variant="outline" className={statusStyles[status]}>
          {unitStatusLabels[status]}
        </Badge>
      )
    },
  }),
  unitColumnHelper.accessor("updatedAt", {
    header: "Cập nhật lúc",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),
  unitColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const unit = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <PermissionGate permission="items:update">
            <Tooltip>
              <UpdateUnitDialog
                unit={unit}
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
          <PermissionGate permission="items:update">
            <Tooltip>
              <DeleteUnitDialog
                unit={unit}
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
