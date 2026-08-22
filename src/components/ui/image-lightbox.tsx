import { useState } from "react"
import { RefreshCw, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SCALE_STEP = 0.25

type LightboxViewerProps = {
  src: string
  alt: string
}

// Zoom/rotation state lives here, not in ImageLightbox itself — Radix's DialogContent unmounts
// its children whenever the dialog closes (no forceMount), so this component remounts fresh on
// every open and the state resets for free. No effect needed.
function LightboxViewer({ src, alt }: LightboxViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  return (
    <>
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-muted/30">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-150 ease-out"
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
        />
      </div>

      <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Thu nhỏ"
          disabled={scale <= MIN_SCALE}
          onClick={() =>
            setScale((value) => Math.max(MIN_SCALE, value - SCALE_STEP))
          }
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Phóng to"
          disabled={scale >= MAX_SCALE}
          onClick={() =>
            setScale((value) => Math.min(MAX_SCALE, value + SCALE_STEP))
          }
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Xoay trái"
          onClick={() => setRotation((value) => value - 90)}
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Xoay phải"
          onClick={() => setRotation((value) => value + 90)}
        >
          <RotateCw className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Đặt lại"
          onClick={() => {
            setScale(1)
            setRotation(0)
          }}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>
    </>
  )
}

type ImageLightboxProps = {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Full-screen click-to-zoom preview for a single image — pure display, no upload/business logic,
// so it lives here (like Dialog/Button) rather than duplicated per feature.
export function ImageLightbox({
  src,
  alt,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[85vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <LightboxViewer src={src} alt={alt} />
      </DialogContent>
    </Dialog>
  )
}
