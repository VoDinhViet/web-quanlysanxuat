import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { DateTime } from "luxon"
import { Copy, Edit3, Eye, Trash2 } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { ProductDetails } from "@/features/products/components/ProductDetails"
import { PRODUCT_STATUS_LABELS } from "@/features/products/types/product.type"
import type { Product } from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"

const productColumnHelper = createColumnHelper<Product>()

export const productColumns = [
  productColumnHelper.display({
    id: "image",
    header: "Hình ảnh",
    meta: { headerClassName: "w-16 text-center", cellClassName: "text-center" },
    cell: ({ row }) => {
      const product = row.original

      return (
        <AspectRatio
          ratio={1}
          className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted/40"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
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
  productColumnHelper.accessor("customerName", {
    header: "Khách hàng",
    cell: ({ getValue }) => getValue() ?? "—",
    meta: { headerClassName: "min-w-36" },
  }),
  productColumnHelper.accessor("code", {
    header: "Mã sản phẩm",
    meta: { headerClassName: "min-w-24" },
  }),
  productColumnHelper.accessor("name", {
    header: "Tên sản phẩm",
    meta: { headerClassName: "min-w-44", cellClassName: "font-normal" },
  }),
  productColumnHelper.accessor("productGroupName", {
    header: "Nhóm sản phẩm",
    cell: ({ getValue }) => getValue() ?? "—",
    meta: { headerClassName: "min-w-32" },
  }),
  productColumnHelper.accessor("revision", {
    header: "Rev",
    meta: { headerClassName: "w-16 text-center", cellClassName: "text-center" },
  }),
  productColumnHelper.accessor("unit", {
    header: "ĐVT",
    meta: { headerClassName: "w-16 text-center", cellClassName: "text-center" },
  }),
  productColumnHelper.accessor("status", {
    header: "Trạng thái",
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge
          variant="outline"
          className={cn(
            "h-5 border-transparent px-2 text-[10px] font-medium",
            status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {PRODUCT_STATUS_LABELS[status]}
        </Badge>
      )
    },
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
  }),
  productColumnHelper.accessor("createdByName", {
    header: "Người tạo",
    meta: { headerClassName: "min-w-28" },
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
          <ProductDetails
            product={product}
            trigger={
              <IconButton label="Xem chi tiết">
                <Eye className="size-3.5" />
              </IconButton>
            }
          />
          <PermissionGate permission="products:update">
            <IconButton label="Chỉnh sửa">
              <Edit3 className="size-3.5" />
            </IconButton>
          </PermissionGate>
          <PermissionGate permission="products:copy">
            <IconButton label="Nhân bản">
              <Copy className="size-3.5" />
            </IconButton>
          </PermissionGate>
          <PermissionGate permission="products:delete">
            <IconButton label="Xóa">
              <Trash2 className="size-3.5" />
            </IconButton>
          </PermissionGate>
        </div>
      )
    },
  }),
]
