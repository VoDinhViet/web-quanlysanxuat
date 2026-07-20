import { Link } from "@tanstack/react-router"
import { Icon } from "@iconify/react"
import userBold from "@iconify-icons/solar/user-bold"
import { createColumnHelper } from "@tanstack/react-table"
import { Edit3, MoreHorizontal, ShieldCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import {
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus,
} from "@/features/users/types/user.type"
import type { User } from "@/features/users/types/user.type"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASSNAME: Record<EmployeeStatus, string> = {
  [EmployeeStatus.WORKING]: "bg-emerald-100 text-emerald-700",
  [EmployeeStatus.RESIGNED]: "bg-slate-100 text-slate-600",
}

const userColumnHelper = createColumnHelper<User>()

export const userColumns = [
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
            <AvatarImage
              src={user.avatar ? resolveFileUrl(user.avatar.url) : undefined}
              alt={user.fullName}
            />
            <AvatarFallback>
              <Icon icon={userBold} className="size-3/5" />
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs font-medium text-foreground">
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
        <Badge
          variant="outline"
          className={cn(
            "h-5 rounded-full border-transparent px-2.5 text-[10px] font-medium",
            STATUS_BADGE_CLASSNAME[status]
          )}
        >
          {EMPLOYEE_STATUS_LABELS[status]}
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
          <PermissionGate permission="users:update">
            <IconButton label="Chỉnh sửa" asChild>
              <Link
                to="/manage/users/$userId/edit"
                params={{ userId: user.id }}
              >
                <Edit3 className="size-3.5" />
              </Link>
            </IconButton>
          </PermissionGate>
          <PermissionGate permission="roles:update">
            <IconButton label="Phân quyền">
              <ShieldCheck className="size-3.5" />
            </IconButton>
          </PermissionGate>
          <IconButton label="Thao tác khác">
            <MoreHorizontal className="size-3.5" />
          </IconButton>
        </div>
      )
    },
  }),
]
