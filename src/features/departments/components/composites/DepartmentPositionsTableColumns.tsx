import {
  PenNewSquare,
  TrashBinTrash,
  UsersGroupRounded,
} from "@solar-icons/react"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Button, LinkButton } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeletePositionDialog } from "@/features/departments/components/composites/DeletePositionDialog"
import { UpdatePositionDialog } from "@/features/departments/components/composites/UpdatePositionDialog"
import type { Position } from "@/lib/types/position.type"

const positionColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Position
>()

export const departmentPositionColumns = positionColumnHelper.columns([
  positionColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  positionColumnHelper.accessor("code", {
    header: "Mã chức vụ",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),
  positionColumnHelper.accessor("name", {
    header: "Tên chức vụ",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  positionColumnHelper.accessor("employeeCount", {
    header: "Nhân sự",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => {
      const position = row.original

      return (
        <LinkButton
          to="/manage/users"
          search={{ page: 1, limit: 10, positionId: position.id }}
          variant="link"
          size="xs"
          className="gap-1.5 px-0 text-xs font-medium"
        >
          <UsersGroupRounded className="size-3.5" />
          {position.employeeCount}
        </LinkButton>
      )
    },
  }),
  positionColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const position = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <PermissionGate permission="positions:update">
            <UpdatePositionDialog
              position={position}
              trigger={
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
          </PermissionGate>
          <PermissionGate permission="positions:delete">
            <DeletePositionDialog
              position={position}
              trigger={
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
          </PermissionGate>
        </div>
      )
    },
  }),
])
