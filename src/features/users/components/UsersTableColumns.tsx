import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { Edit3, Eye, ShieldCheck } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { UserDetails } from "@/features/users/components/UserDetails"
import {
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus,
} from "@/features/users/types/user.type"
import type { User } from "@/features/users/types/user.type"
import { cn, getInitials } from "@/lib/utils"

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
          <Avatar size="sm">
            <AvatarFallback className="bg-linear-to-br from-slate-200 to-slate-500 text-[10px] font-medium text-slate-950">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs font-medium text-foreground">
            {user.fullName}
          </span>
        </div>
      )
    },
  }),
  userColumnHelper.accessor("email", {
    header: "Email",
    cell: ({ getValue }) => getValue() ?? "—",
    meta: { headerClassName: "min-w-52" },
  }),
  userColumnHelper.accessor("phoneNumber", {
    header: "Số điện thoại",
    cell: ({ getValue }) => getValue() ?? "—",
    meta: { headerClassName: "min-w-32" },
  }),
  userColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const status = getValue()
      const isWorking = status === EmployeeStatus.WORKING

      return (
        <Badge
          variant="outline"
          className={cn(
            "h-5 border-transparent px-2 text-[10px] font-medium",
            isWorking
              ? "bg-emerald-100 text-emerald-700"
              : "bg-orange-100 text-orange-700"
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
          <UserDetails
            user={user}
            trigger={
              <IconButton label="Xem chi tiết">
                <Eye className="size-3.5" />
              </IconButton>
            }
          />
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
        </div>
      )
    },
  }),
]
