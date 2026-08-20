import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { ImageOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { currencyFormatter } from "@/lib/currency"
import { resolveFileUrl } from "@/lib/file-url"
import { orderItemStatusLabels, OrderItemStatus } from "@/lib/types/order.type"
import type { OrderItem } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const col = createColumnHelper<OrderItem>()

export const orderDetailItemColumns = [
  col.display({
    id: "index",
    header: "#",
    meta: { headerClassName: "w-10", cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.index + 1,
  }),

  // Thumbnail + name-over-code — same combined identity cell as
  // ProductsTableColumns, so a product reads the same way whether staff are
  // browsing the catalog or an order's line items. `image` is the line's own
  // snapshot (OrderItem.image), not the live product's current image.
  col.display({
    id: "product",
    header: "Sản phẩm",
    meta: { headerClassName: "min-w-56" },
    cell: ({ row }) => {
      const { item, image } = row.original

      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {image ? (
              <Image
                src={resolveFileUrl(image.url)}
                alt={item.name}
                layout="fullWidth"
                objectFit="cover"
                className="size-full"
              />
            ) : (
              <ImageOff className="size-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              to="/manage/products/$productId"
              params={{ productId: item.id }}
              search={{ tab: "info" }}
              className="block truncate font-medium text-foreground hover:text-primary hover:underline"
            >
              {item.name}
            </Link>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {item.code}
            </p>
          </div>
        </div>
      )
    },
  }),

  col.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
  }),

  col.accessor("quantity", {
    header: "Số lượng",
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),

  col.accessor("unitPrice", {
    header: "Đơn giá",
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => currencyFormatter.format(getValue()),
  }),

  col.accessor("discountPercent", {
    header: "CK (%)",
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right tabular-nums",
    },
  }),

  col.accessor("lineTotal", {
    header: "Thành tiền",
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-medium tabular-nums",
    },
    cell: ({ getValue }) => currencyFormatter.format(getValue()),
  }),

  col.accessor("issuedQty", {
    header: "Đã giao",
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right text-muted-foreground tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),

  // Can go negative if the line was issued past its ordered quantity — flagged destructive
  // instead of the usual muted tone so an over-issue doesn't read as a normal balance.
  col.accessor("remainingQty", {
    header: "Còn lại",
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
    cell: ({ getValue }) => {
      const remaining = getValue()
      return (
        <span
          className={cn(
            "tabular-nums",
            remaining < 0
              ? "font-semibold text-destructive"
              : "text-muted-foreground"
          )}
        >
          {quantityFormatter.format(remaining)}
        </span>
      )
    },
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: { headerClassName: "text-center", cellClassName: "text-center" },
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <Badge
          variant="outline"
          className={cn(
            status === OrderItemStatus.CANCELLED
              ? "text-destructive"
              : "text-success"
          )}
        >
          {orderItemStatusLabels[status]}
        </Badge>
      )
    },
  }),
]
