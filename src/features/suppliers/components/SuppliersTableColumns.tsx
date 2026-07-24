import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { cva } from "class-variance-authority"
import { Image } from "@unpic/react"
import { Edit3, Eye, Trash2 } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import {
  SUPPLIER_STATUS_LABELS,
  SupplierStatus,
} from "@/features/suppliers/types/supplier.type"
import { resolveFileUrl } from "@/lib/file-url"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      [SupplierStatus.ACTIVE]: "bg-success/15 text-success",
      [SupplierStatus.PAUSED]: "bg-warning/15 text-warning",
      [SupplierStatus.STOPPED]: "bg-destructive/15 text-destructive",
    },
  },
})

const supplierColumnHelper = createColumnHelper<Supplier>()

export const supplierColumns = [
  supplierColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  supplierColumnHelper.accessor("code", {
    header: "Mã NCC",
    meta: { headerClassName: "min-w-24" },
  }),
  supplierColumnHelper.display({
    id: "logo",
    header: "",
    meta: { headerClassName: "w-14", cellClassName: "pr-0" },
    cell: ({ row }) => {
      const supplier = row.original

      return (
        <AspectRatio
          ratio={1}
          className="size-9 shrink-0 overflow-hidden rounded-lg bg-muted/40"
        >
          {supplier.logo ? (
            <Image
              src={resolveFileUrl(supplier.logo.url)}
              alt={supplier.name}
              layout="fullWidth"
              objectFit="cover"
              className="size-full"
            />
          ) : (
            <img
              src="/empty-image.svg"
              alt=""
              className="size-full object-contain p-2"
            />
          )}
        </AspectRatio>
      )
    },
  }),
  supplierColumnHelper.accessor("name", {
    header: "Tên nhà cung cấp",
    meta: { headerClassName: "min-w-52", cellClassName: "font-normal pl-0" },
    cell: ({ row }) => {
      const supplier = row.original

      return (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">
            {supplier.name}
          </p>
          {supplier.note ? (
            <p className="truncate text-[11px] text-muted-foreground">
              {supplier.note}
            </p>
          ) : null}
        </div>
      )
    },
  }),
  supplierColumnHelper.accessor((row) => row.group.name, {
    id: "group",
    header: "Nhóm NCC",
    meta: { headerClassName: "min-w-32" },
  }),
  supplierColumnHelper.accessor("taxCode", {
    header: "Mã số thuế",
    meta: { headerClassName: "min-w-28" },
  }),
  supplierColumnHelper.accessor(
    (row) => {
      const primary = row.representatives.find((rep) => rep.isPrimary)

      return (primary ?? row.representatives.at(0))?.name
    },
    {
      id: "representative",
      header: "Đại diện / Người liên hệ",
      meta: { headerClassName: "min-w-44" },
      cell: ({ row, getValue }) => {
        const supplier = row.original

        return (
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              {getValue() ?? "—"}
            </p>
            {supplier.email ? (
              <p className="truncate text-[11px] text-muted-foreground">
                {supplier.email}
              </p>
            ) : null}
          </div>
        )
      },
    }
  ),
  supplierColumnHelper.accessor("phoneNumber", {
    header: "Điện thoại",
    meta: { headerClassName: "min-w-28" },
  }),
  supplierColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge variant="outline" className={statusBadgeVariants({ status })}>
          {SUPPLIER_STATUS_LABELS[status]}
        </Badge>
      )
    },
  }),
  supplierColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      // View/delete are placeholders until there's a detail/delete CRUD pass.
      <div className="flex items-center justify-center gap-1.5">
        <IconButton
          label="Xem chi tiết"
          className="text-muted-foreground hover:border-primary/30 hover:text-primary"
        >
          <Eye className="size-3.5" />
        </IconButton>
        <PermissionGate permission="suppliers:update">
          <IconButton
            label="Chỉnh sửa"
            asChild
            className="text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            <Link
              to="/manage/suppliers/$supplierId/update"
              params={{ supplierId: row.original.id }}
            >
              <Edit3 className="size-3.5" />
            </Link>
          </IconButton>
        </PermissionGate>
        <PermissionGate permission="suppliers:delete">
          <IconButton
            label="Xóa"
            className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </IconButton>
        </PermissionGate>
      </div>
    ),
  }),
]
