import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { DateTime } from "luxon"
import { Copy, Eye, ImageOff, Trash2 } from "lucide-react"

import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { CopyProductDialog } from "@/features/products/components/CopyProductDialog"
import { DeleteProductDialog } from "@/features/products/components/DeleteProductDialog"
import { ProductStatusBadge } from "@/features/products/components/ProductBadges"
import { resolveFileUrl } from "@/lib/file-url"
import type { Product } from "@/features/products/types/product.type"

const productColumnHelper = createColumnHelper<Product>()

export const productColumns = [
  productColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
  }),
  // Combined identity cell — thumbnail + name over code reads far faster than
  // three separate image / code / name columns.
  productColumnHelper.display({
    id: "product",
    header: "Sản phẩm",
    meta: { headerClassName: "min-w-64" },
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {product.image ? (
              <Image
                src={resolveFileUrl(product.image.url)}
                alt={product.name}
                layout="fullWidth"
                objectFit="cover"
                className="size-full"
              />
            ) : (
              <ImageOff className="size-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {product.name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {product.code}
            </p>
          </div>
        </div>
      )
    },
  }),
  productColumnHelper.accessor((row) => row.client?.name ?? "—", {
    id: "client",
    header: "Khách hàng",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  productColumnHelper.accessor((row) => row.group?.name ?? "—", {
    id: "group",
    header: "Nhóm sản phẩm",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  productColumnHelper.accessor("revision", {
    header: "Rev",
    meta: {
      headerClassName: "w-16 text-center",
      cellClassName: "text-center font-mono text-muted-foreground",
    },
  }),
  productColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center",
    },
  }),
  productColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <ProductStatusBadge status={getValue()} />,
  }),
  productColumnHelper.accessor((row) => row.creator?.username ?? "—", {
    id: "creator",
    header: "Người tạo",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  productColumnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
    meta: { headerClassName: "min-w-28" },
  }),
  productColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          {/* One destination, one button: the detail screen is where a product
              is both read and edited, and it guards writes on its own. */}
          <IconButton
            label="Xem chi tiết"
            asChild
            className="text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            <Link
              to="/manage/products/$productId"
              params={{ productId: product.id }}
              search={{ tab: "info" }}
            >
              <Eye className="size-3.5" />
            </Link>
          </IconButton>
          <PermissionGate permission="products:copy">
            <CopyProductDialog
              product={product}
              trigger={
                <IconButton
                  label="Nhân bản"
                  className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  <Copy className="size-3.5" />
                </IconButton>
              }
            />
          </PermissionGate>
          <PermissionGate permission="products:delete">
            <DeleteProductDialog
              product={product}
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
