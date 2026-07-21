import { createColumnHelper } from "@tanstack/react-table"
import { Edit3, Eye, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import {
  CLIENT_STATUS_LABELS,
  ClientStatus,
} from "@/features/clients/types/client.type"
import type { Client } from "@/features/clients/types/client.type"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASSNAME: Record<ClientStatus, string> = {
  [ClientStatus.ACTIVE]: "bg-success/15 text-success",
  [ClientStatus.PAUSED]: "bg-warning/15 text-warning",
}

const clientColumnHelper = createColumnHelper<Client>()

export const clientColumns = [
  clientColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  clientColumnHelper.accessor("code", {
    header: "Mã khách hàng",
    meta: { headerClassName: "min-w-28" },
  }),
  clientColumnHelper.accessor("name", {
    header: "Tên khách hàng",
    meta: { headerClassName: "min-w-52" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  clientColumnHelper.accessor(
    (row) => {
      const primary = row.contacts.find((contact) => contact.isPrimary)

      return (primary ?? row.contacts.at(0))?.name
    },
    {
      id: "primaryContact",
      header: "Người liên hệ chính",
      meta: { headerClassName: "min-w-40" },
      cell: ({ getValue }) => getValue() ?? "—",
    }
  ),
  clientColumnHelper.accessor("phoneNumber", {
    header: "Điện thoại",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  clientColumnHelper.accessor("email", {
    header: "Email",
    meta: { headerClassName: "min-w-44" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  clientColumnHelper.accessor((row) => row.group.name, {
    id: "group",
    header: "Nhóm khách hàng",
    meta: { headerClassName: "min-w-32" },
  }),
  clientColumnHelper.accessor("status", {
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
          {CLIENT_STATUS_LABELS[status]}
        </Badge>
      )
    },
  }),
  clientColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "font-normal",
    },
    // View/edit/more are placeholders until a detail/edit CRUD pass exists.
    cell: () => (
      <div className="flex items-center justify-center gap-1.5">
        <IconButton
          label="Xem chi tiết"
          className="text-muted-foreground hover:border-primary/30 hover:text-primary"
        >
          <Eye className="size-3.5" />
        </IconButton>
        <PermissionGate permission="clients:update">
          <IconButton
            label="Chỉnh sửa"
            className="text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            <Edit3 className="size-3.5" />
          </IconButton>
        </PermissionGate>
        <IconButton
          label="Thao tác khác"
          className="text-muted-foreground hover:border-primary/30 hover:text-primary"
        >
          <MoreHorizontal className="size-3.5" />
        </IconButton>
      </div>
    ),
  }),
]
