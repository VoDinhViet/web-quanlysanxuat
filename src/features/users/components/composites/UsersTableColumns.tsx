import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Edit3, MoreHorizontal, ShieldCheck } from "lucide-react"
import { Gallery } from "@solar-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/primitives/IconButton"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { employeeStatusLabels } from "@/lib/types/user.type"
import type { EmployeeStatus, UserListItem } from "@/lib/types/user.type"
import { resolveFileUrl } from "@/lib/file-url"

const employeeStatusStyles: Record<EmployeeStatus, string> = {
  WORKING: "bg-success/15 text-success",
  RESIGNED: "bg-muted text-muted-foreground",
}

const userColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  UserListItem
>()

export const userColumns = userColumnHelper.columns([
  userColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  userColumnHelper.accessor("code", {
    header: "Mã nhân viên",
    meta: { headerClassName: "min-w-24" },
  }),
  userColumnHelper.accessor("fullName", {
    header: "Họ và tên",
    meta: { headerClassName: "min-w-44", cellClassName: "font-normal" },
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9">
            {user.avatar && (
              <AvatarImage
                src={resolveFileUrl(user.avatar.url)}
                alt={user.fullName}
              />
            )}
            <AvatarFallback className="bg-muted">
              <Gallery className="size-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <span className="max-w-48 min-w-0 truncate text-xs font-medium text-foreground">
            {user.fullName}
          </span>
        </div>
      )
    },
  }),
  userColumnHelper.accessor((row) => row.department.name, {
    id: "department",
    header: "Phòng ban",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  userColumnHelper.accessor((row) => row.position.name, {
    id: "position",
    header: "Chức vụ",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  userColumnHelper.accessor((row) => row.role?.name, {
    id: "role",
    header: "Vai trò",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() ?? "—"}</span>
    ),
  }),
  userColumnHelper.accessor("email", {
    header: "Email",
    cell: ({ getValue }) => getValue() ?? "—",
    meta: { headerClassName: "min-w-52" },
  }),
  userColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge variant="outline" className={employeeStatusStyles[status]}>
          {employeeStatusLabels[status]}
        </Badge>
      )
    },
  }),
  userColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <RoutePermissionGate route="/manage/users/$userId/update">
            <IconButton
              label="Chỉnh sửa"
              asChild
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Link
                to="/manage/users/$userId/update"
                params={{ userId: user.id }}
              >
                <Edit3 className="size-3.5" />
              </Link>
            </IconButton>
          </RoutePermissionGate>
          <PermissionGate permission="roles:update">
            <IconButton
              label="Phân quyền"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <ShieldCheck className="size-3.5" />
            </IconButton>
          </PermissionGate>
          <IconButton
            label="Thao tác khác"
            className="text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            <MoreHorizontal className="size-3.5" />
          </IconButton>
        </div>
      )
    },
  }),
])
