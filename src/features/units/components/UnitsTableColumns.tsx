import { Edit3, Trash2 } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import { IconButton } from "@/components/shared/buttons/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { DeleteUnitDialog } from "@/features/units/components/DeleteUnitDialog"
import { UnitScopeBadge } from "@/features/units/components/UnitBadges"
import { UpdateUnitDialog } from "@/features/units/components/UpdateUnitDialog"
import type { UnitDetail } from "@/lib/types/unit.type"

const unitColumnHelper = createColumnHelper<UnitDetail>()

export const unitColumns = [
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
  unitColumnHelper.accessor("scopes", {
    header: "Phạm vi sử dụng",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">
        {getValue().map((scope) => (
          <UnitScopeBadge key={scope} scope={scope} />
        ))}
      </div>
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
            <UpdateUnitDialog
              unit={unit}
              trigger={
                <IconButton
                  label="Chỉnh sửa"
                  className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  <Edit3 className="size-3.5" />
                </IconButton>
              }
            />
          </PermissionGate>
          <PermissionGate permission="items:update">
            <DeleteUnitDialog
              unit={unit}
              trigger={
                <IconButton
                  label="Xóa"
                  className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              }
            />
          </PermissionGate>
        </div>
      )
    },
  }),
]
