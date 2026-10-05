import { Gallery } from "@solar-icons/react"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type UnfulfilledItemImageCellProps = {
  image: FileResource | null
  name: string
}

export function UnfulfilledItemImageCell({
  image,
  name,
}: UnfulfilledItemImageCellProps) {
  return (
    <div className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
      {image ? (
        <ZoomableImage src={resolveFileUrl(image.url)} alt={name} />
      ) : (
        <Gallery className="size-4 text-muted-foreground/50" />
      )}
    </div>
  )
}

// "Có thể giao" = Tồn TP − Đã giữ, không chặn về 0: > 0 xanh, = 0 cam (hết tồn hoặc đã bị DO khác
// giữ hết), < 0 đỏ (lỗi — DO đang giữ nhiều hơn tồn).
export function AvailableQuantityCell({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        value > 0 && "text-success",
        value === 0 && "text-warning",
        value < 0 && "text-destructive"
      )}
    >
      {quantityFormatter.format(value)}
    </span>
  )
}

const legendItems = [
  { dotClassName: "bg-success", label: "Có thể giao > 0" },
  {
    dotClassName: "bg-warning",
    label: "Có thể giao = 0 (hết tồn hoặc đã giữ hết)",
  },
  { dotClassName: "bg-destructive", label: "Có thể giao < 0 (lỗi)" },
]

export function AvailableQuantityLegend() {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
      {legendItems.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", item.dotClassName)} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
