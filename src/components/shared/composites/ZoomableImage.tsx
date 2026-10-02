import { useState } from "react"
import { Gallery } from "@solar-icons/react"

import { ImageLightbox } from "@/components/ui/image-lightbox"
import { cn } from "@/lib/utils"

type ZoomableImageProps = {
  /** URL đã qua `resolveFileUrl`. */
  src: string
  alt: string
  fit?: "cover" | "contain"
  className?: string
}

// Ảnh thu nhỏ trong bảng/ô: bấm vào mở `ImageLightbox` (phóng to/xoay/kéo). Lấp đầy ô cha nên
// khung (kích thước, viền, bo góc) vẫn do nơi gọi quyết định, như `<Image className="size-full">`
// trước đây. Ảnh lỗi (file đã bị dọn → 404) rơi về icon thay vì ô vỡ. `stopPropagation` ở cả nút
// lẫn lightbox: sự kiện React nổi lên qua portal, không chặn thì bấm ảnh trong hàng bảng có
// `onClick` điều hướng sẽ chuyển trang.
export function ZoomableImage({
  src,
  alt,
  fit = "cover",
  className,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null)

  if (brokenSrc === src) {
    return <Gallery className="size-4 text-muted-foreground/50" />
  }

  return (
    <>
      <button
        type="button"
        title="Bấm để phóng to"
        aria-label={`Phóng to ảnh ${alt}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
        className={cn("block size-full cursor-zoom-in", className)}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setBrokenSrc(src)}
          className={cn(
            "size-full",
            fit === "contain" ? "object-contain" : "object-cover"
          )}
        />
      </button>
      <span
        role="presentation"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <ImageLightbox src={src} alt={alt} open={open} onOpenChange={setOpen} />
      </span>
    </>
  )
}
