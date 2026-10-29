import { Gallery } from "@solar-icons/react"
import { format, parseISO } from "date-fns"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"
import { vnZone } from "@/lib/time"
import type { PurchaseOrderItemDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderItemProductCellProps = {
  item: PurchaseOrderItemDetail
}

export function PurchaseOrderItemProductCell({
  item,
}: PurchaseOrderItemProductCellProps) {
  const { item: product, purchaseRequest } = item.purchaseRequestItem
  const note = item.purchaseRequestItem.note
  const reason = item.quantityAdjustmentReason

  return (
    <div className="flex min-w-0 items-start gap-3 py-1">
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
        <span className="leading-snug font-medium text-foreground">
          {product.name}
        </span>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground tabular-nums">
          <span className="font-mono font-medium text-foreground/80">
            {product.code}
          </span>
          <span>•</span>
          <span className="font-mono">{purchaseRequest.code}</span>
          {item.neededDate && (
            <>
              <span>•</span>
              <span>
                Cần:{" "}
                {format(
                  parseISO(item.neededDate, { in: vnZone }),
                  "dd/MM/yyyy"
                )}
              </span>
            </>
          )}
        </div>
        {(note || reason) && (
          <div className="mt-0.5 flex flex-col gap-0.5 text-[11px] leading-tight text-muted-foreground">
            {note && <p className="italic">"{note}"</p>}
            {reason && (
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Điều chỉnh SL: {reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
