import { Gallery } from "@solar-icons/react"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"

type ItemImageCellProps = {
  image: Pick<FileResource, "url"> | null | undefined
  name: string
}

// Ô ảnh vật tư/thành phẩm trong bảng: khung 40px, bấm vào để phóng to; không có ảnh thì hiện icon.
export function ItemImageCell({ image, name }: ItemImageCellProps) {
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
