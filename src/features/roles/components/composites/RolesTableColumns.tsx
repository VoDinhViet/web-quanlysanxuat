import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Edit3, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LinkButton, Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteRoleDialog } from "@/features/roles/components/composites/DeleteRoleDialog"
import type { Role } from "@/lib/types/role.type"

const roleColumnHelper = createColumnHelper<typeof appTableFeatures, Role>()

export const roleColumns = roleColumnHelper.columns([
  roleColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  roleColumnHelper.accessor("code", {
    header: "Mã vai trò",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),
  roleColumnHelper.accessor("name", {
    header: "Tên vai trò",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  roleColumnHelper.accessor("description", {
    header: "Mô tả",
    meta: { headerClassName: "min-w-52" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  roleColumnHelper.accessor((row) => row.permissions.length, {
    id: "permissionsCount",
    header: "Số quyền",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <Badge variant="outline">{getValue()} quyền</Badge>,
  }),
  roleColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const role = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <RoutePermissionGate route="/manage/roles/$roleId/update">
            <TooltipTrigger>
              <LinkButton
                to="/manage/roles/$roleId/update"
                params={{ roleId: role.id }}
                variant="outline"
                size="icon-sm"
                aria-label="Chỉnh sửa"
                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
              >
                <Edit3 className="size-3.5" />
              </LinkButton>
              <Tooltip>Chỉnh sửa</Tooltip>
            </TooltipTrigger>
          </RoutePermissionGate>
          <PermissionGate permission="roles:delete">
            <DeleteRoleDialog
              role={role}
              trigger={
                <TooltipTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Xóa"
                    className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <Tooltip>Xóa</Tooltip>
                </TooltipTrigger>
              }
            />
          </PermissionGate>
        </div>
      )
    },
  }),
])
