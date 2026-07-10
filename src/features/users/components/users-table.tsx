import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Column } from "@tanstack/react-table"
import { Edit3, Eye, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/features/users/components/status-badge"
import { UserDetails } from "@/features/users/components/user-details"
import type { User } from "@/features/users/types/user.type"
import { cn } from "@/lib/utils"

const userColumnHelper = createColumnHelper<User>()

const userColumns = [
  userColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  userColumnHelper.accessor("id", {
    header: "Mã nhân viên",
  }),
  userColumnHelper.accessor("name", {
    header: "Họ và tên",
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="sm">
            <AvatarImage src={user.avatarFallbackSrc} alt={user.name} />
            <AvatarFallback
              className={cn(
                "bg-linear-to-br text-[10px] font-medium",
                user.avatarClassName
              )}
            >
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs font-medium text-foreground">
            {user.name}
          </span>
        </div>
      )
    },
  }),
  userColumnHelper.accessor("department", {
    header: "Phòng ban",
  }),
  userColumnHelper.accessor("position", {
    header: "Chức vụ",
  }),
  userColumnHelper.accessor("email", {
    header: "Email",
  }),
  userColumnHelper.accessor("status", {
    header: "Trạng thái",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  userColumnHelper.display({
    id: "actions",
    header: "Thao tác",
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
          <IconButton label="Chỉnh sửa">
            <Edit3 className="size-3.5" />
          </IconButton>
          <IconButton label="Phân quyền">
            <ShieldCheck className="size-3.5" />
          </IconButton>
        </div>
      )
    },
  }),
]

export function UsersTable({ rows }: { rows: User[] }) {
  const table = useReactTable({
    data: rows,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="min-w-0 flex-1 overflow-hidden px-4 pb-4 lg:px-5">
      <div className="overflow-hidden rounded-md border border-border/50 bg-card">
        <Table className="text-xs [&_td]:border-r [&_td]:border-border/40 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/40 [&_th:last-child]:border-r-0">
          <TableHeader className="bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-13 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={getUserHeaderClassName(header.column)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/20">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={getUserCellClassName(cell.column)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function getUserHeaderClassName(column: Column<User>) {
  return cn(
    "px-4 text-xs font-semibold text-foreground",
    column.id === "index" && "w-12 text-center",
    column.id === "id" && "min-w-24",
    column.id === "name" && "min-w-44",
    column.id === "department" && "min-w-32",
    column.id === "position" && "min-w-40",
    column.id === "email" && "min-w-52",
    column.id === "status" && "min-w-28 text-center",
    column.id === "actions" && "min-w-32 text-center"
  )
}

function getUserCellClassName(column: Column<User>) {
  return cn(
    "px-4 py-0 text-xs font-medium text-foreground",
    column.id === "index" && "text-center",
    column.id === "name" && "font-normal",
    column.id === "status" && "text-center",
    column.id === "actions" && "font-normal"
  )
}

function IconButton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}
