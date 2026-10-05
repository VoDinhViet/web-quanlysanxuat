import { Gallery } from "@solar-icons/react"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"
import type { PurchaseOrderItemDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderItemProductCellProps = {
  item: PurchaseOrderItemDetail
}

// Ô "Vật tư" của bảng chi tiết PO: ảnh + tên, mã vật tư và mã PR nguồn xếp dưới tên. Mã PR giữ lại
// vì 2 dòng cùng vật tư (tách từ 1 dòng RFQ gộp) chỉ khác nhau ở đó.
export function PurchaseOrderItemProductCell({
  item,
}: PurchaseOrderItemProductCellProps) {
  const { item: product, purchaseRequest } = item.purchaseRequestItem

  return (
    <div className="flex min-w-0 items-center gap-3 py-1">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
        {product.image ? (
          <ZoomableImage
            src={resolveFileUrl(product.image.url)}
            alt={product.name}
          />
        ) : (
          <Gallery className="size-4 text-muted-foreground/50" />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium text-foreground">{product.name}</span>
        <span className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">
            {product.code}
          </span>
          <span>{purchaseRequest.code}</span>
        </span>
      </div>
    </div>
  )
}
