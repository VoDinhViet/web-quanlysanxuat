import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { AltArrowLeft, Box } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { resolveFileUrl } from "@/lib/file-url"
import type { Item } from "@/lib/types/item.type"
import type { FileResource } from "@/lib/types/file.type"

type InventoryProductDetailHeaderProps = {
  item: Item
}

// Back link + thumbnail + title/code row — page-level chrome, same shape as
// ProductDetailHeader.tsx's own top row. The facts grid (Mã/ĐVT/Khách hàng/Ghi chú) lives in its
// own card, InventoryProductInfoCard.tsx, so it can sit beside the stock-overview card as two
// matched panels instead of one tall column beside a short one.
export function InventoryProductDetailHeader({
  item,
}: InventoryProductDetailHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
        aria-label="Quay lại danh sách tồn kho thành phẩm"
        asChild
      >
        <Link to="/manage/inventory-products" search={{ page: 1, limit: 20 }}>
          <AltArrowLeft className="size-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>
      </Button>

      <ItemHeaderThumbnail image={item.image} name={item.name} />

      <div className="min-w-0">
        <h2 className="min-w-0 truncate text-base leading-snug font-semibold text-foreground sm:text-lg">
          {item.name}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">
            {item.code}
          </span>
          <Dot />
          <span>ĐVT: {item.unit.name}</span>
        </div>
      </div>
    </div>
  )
}

function Dot() {
  return <span className="text-border">•</span>
}

type ItemHeaderThumbnailProps = {
  image: FileResource | null
  name: string
}

// Same broken-image-fallback idiom as ProductDetailHeader.tsx's own ProductHeaderThumbnail —
// resets in-render on image change instead of an effect (React Compiler blocks a synchronous
// setState inside an effect).
function ItemHeaderThumbnail({ image, name }: ItemHeaderThumbnailProps) {
  const [isBroken, setIsBroken] = useState(false)
  const [prevImageId, setPrevImageId] = useState(image?.id)
  if (image?.id !== prevImageId) {
    setPrevImageId(image?.id)
    setIsBroken(false)
  }

  if (!image || isBroken) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Box className="size-5" />
      </div>
    )
  }

  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
      <img
        src={resolveFileUrl(image.url)}
        alt={name}
        className="size-full object-cover"
        onError={() => setIsBroken(true)}
      />
    </div>
  )
}
