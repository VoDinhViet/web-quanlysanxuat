import { Image } from "@unpic/react"
import { ImageOff } from "lucide-react"

import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { MaterialInventoryItem } from "@/lib/types/inventory-material.type"

const numberFormatter = new Intl.NumberFormat("vi-VN")

// Local twin of inventory-products' ProductImageCell (features don't import each other's
// components) — but with the real signed-URL path (`resolveFileUrl` + `@unpic/react`'s `Image`),
// not that one's mock raw `<img>`. Standalone "Ảnh" column now — used to be fused into the "Vật
// tư" cell alongside code/name.
export function MaterialImageCell({ item }: { item: MaterialInventoryItem }) {
  const imageUrl = item.image ? resolveFileUrl(item.image.url) : null

  return (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={item.name}
          layout="fullWidth"
          objectFit="cover"
          className="size-full"
        />
      ) : (
        <ImageOff className="size-4 text-muted-foreground/50" />
      )}
    </div>
  )
}

type MaterialQuantityCellVariant = "blue" | "orange" | "green" | "available"

// Local twin of inventory-products' QuantityCell — same 4 variants (`available` turns rose/bold
// when negative; the others are a flat color per column). Kept local rather than imported for the
// same cross-feature-isolation reason as MaterialImageCell above.
export function MaterialQuantityCell({
  value,
  variant,
}: {
  value: number
  variant: MaterialQuantityCellVariant
}) {
  const colorClassName =
    variant === "blue"
      ? "text-blue-600 dark:text-blue-400 font-semibold"
      : variant === "orange"
        ? "text-amber-600 dark:text-amber-400 font-semibold"
        : variant === "green"
          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
          : value < 0
            ? "text-rose-600 dark:text-rose-400 font-bold"
            : "text-foreground font-semibold"

  return (
    <span className={cn("text-xs tabular-nums", colorClassName)}>
      {numberFormatter.format(value)}
    </span>
  )
}
