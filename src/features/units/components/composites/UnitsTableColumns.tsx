import { Edit3, Trash2 } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeleteUnitDialog } from "@/features/units/components/composites/DeleteUnitDialog"
import { UpdateUnitDialog } from "@/features/units/components/composites/UpdateUnitDialog"
import type { Unit } from "@/lib/types/unit.type"

const unitColumnHelper = createColumnHelper<typeof appTableFeatures, Unit>()

export const unitColumns = unitColumnHelper.columns([
  unitColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  unitColumnHelper.accessor("code", {
    header: "Mã đơn vị tính",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),
  unitColumnHelper.accessor("name", {
    header: "Tên đơn vị tính",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
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
                        <Edit3 className="size-3.5" />
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
                        <Trash2 className="size-3.5" />
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
