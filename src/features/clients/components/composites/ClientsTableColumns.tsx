import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Edit3, Eye, MoreHorizontal, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteClientDialog } from "@/features/clients/components/composites/DeleteClientDialog"
import { clientStatusLabels, ClientStatus } from "@/lib/types/client.type"
import type { Client } from "@/lib/types/client.type"
import { cn } from "@/lib/utils"

const statusStyles: Record<ClientStatus, string> = {
  [ClientStatus.ACTIVE]: "bg-success/15 text-success",
  [ClientStatus.PAUSED]: "bg-warning/15 text-warning",
}

const clientColumnHelper = createColumnHelper<typeof appTableFeatures, Client>()

export const clientColumns = clientColumnHelper.columns([
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
        <Badge variant="outline" className={statusStyles[status]}>
          {clientStatusLabels[status]}
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
    // View/more are placeholders until a detail CRUD pass exists.
    cell: ({ row }) => {
      const client = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <TooltipTrigger>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Eye className="size-3.5" />
            </Button>
            <Tooltip>Xem chi tiết</Tooltip>
          </TooltipTrigger>
          <RoutePermissionGate route="/manage/clients/$clientId/update">
            <TooltipTrigger>
              <Link
                to="/manage/clients/$clientId/update"
                params={{ clientId: client.id }}
                aria-label="Chỉnh sửa"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-sm" }),
                  "text-muted-foreground hover:border-primary/30 hover:text-primary"
                )}
              >
                <Edit3 className="size-3.5" />
              </Link>
              <Tooltip>Chỉnh sửa</Tooltip>
            </TooltipTrigger>
          </RoutePermissionGate>
          <PermissionGate permission="clients:delete">
            <DeleteClientDialog
              client={client}
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
          <TooltipTrigger>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Thao tác khác"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
            <Tooltip>Thao tác khác</Tooltip>
          </TooltipTrigger>
        </div>
      )
    },
  }),
])
