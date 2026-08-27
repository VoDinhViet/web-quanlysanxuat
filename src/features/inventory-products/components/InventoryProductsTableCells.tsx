import { Link } from "@tanstack/react-router"
import { Image } from "@unpic/react"
import { Eye, Package } from "lucide-react"

import { IconButton } from "@/components/shared/buttons/IconButton"
import { resolveFileUrl } from "@/lib/file-url"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"
import { cn } from "@/lib/utils"

const numberFmt = new Intl.NumberFormat("vi-VN")

export function ProductImageCell({
  product,
}: {
  product: ProductInventoryItem
}) {
  const imageUrl = product.image ? resolveFileUrl(product.image.url) : null

  return (
    <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={product.name}
          layout="fullWidth"
          objectFit="cover"
          className="size-full"
        />
      ) : (
        <Package className="size-5 text-muted-foreground/70" />
      )}
    </div>
  )
}

export function QuantityCell({
  value,
  variant = "neutral",
}: {
  value: number
  variant?: "blue" | "orange" | "green" | "available" | "neutral"
}) {
  let colorClass = "text-foreground font-medium"

  if (variant === "blue") {
    colorClass = "text-blue-600 dark:text-blue-400 font-semibold"
  } else if (variant === "orange") {
    colorClass = "text-amber-600 dark:text-amber-400 font-semibold"
  } else if (variant === "green") {
    colorClass = "text-emerald-600 dark:text-emerald-400 font-semibold"
  } else if (variant === "available") {
    colorClass =
      value < 0
        ? "text-rose-600 dark:text-rose-400 font-bold"
        : "text-foreground font-semibold"
  }

  return (
    <span className={cn("text-xs tabular-nums", colorClass)}>
      {numberFmt.format(value)}
    </span>
  )
}

// Opens the finished-goods stock detail screen ("Thẻ kho thành phẩm") — replaces the old
// quick-view Dialog, which duplicated a 4-line summary the real detail screen now shows in full
// (plus the transaction ledger, latest-related-document cards, etc.).
export function InventoryProductActionsCell({
  product,
}: {
  product: ProductInventoryItem
}) {
  return (
    <div className="flex items-center justify-center">
      <IconButton
        label="Xem chi tiết"
        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
        asChild
      >
        <Link
          to="/manage/inventory-products/$itemId"
          params={{ itemId: product.id }}
        >
          <Eye className="size-3.5" />
        </Link>
      </IconButton>
    </div>
  )
}
