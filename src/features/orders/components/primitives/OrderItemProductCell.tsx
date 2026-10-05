import { Gallery } from "@solar-icons/react"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"

type OrderItemProductCellProps = {
  name: string
  imageUrl?: string
}

// Ô "Sản phẩm" của bảng nhập số lượng (bước ③ Tạo/Sửa đơn hàng): ảnh + tên. Ảnh/Rev là field
// UI-only trong `OrderItemFormValue`, ghi lúc chọn sản phẩm.
export function OrderItemProductCell({
  name,
  imageUrl,
}: OrderItemProductCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-1">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
        {imageUrl ? (
          <ZoomableImage src={resolveFileUrl(imageUrl)} alt={name} />
        ) : (
          <Gallery className="size-4 text-muted-foreground/50" />
        )}
      </div>
      <span className="min-w-0 truncate font-medium text-foreground">
        {name || "—"}
      </span>
    </div>
  )
}
