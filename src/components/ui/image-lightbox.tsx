import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  RefreshCw,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SCALE_STEP = 0.25

type LightboxViewerProps = {
  src: string
  alt: string
}

// Zoom/rotation state lives here, not in ImageLightbox itself — the dialog unmounts its
// children whenever it closes, so this component remounts fresh on every open and the state
// resets for free. No effect needed.
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
// so it lives here (like Dialog/Button) rather than duplicated per feature. Deliberately not
// built on ui/dialog: a lightbox wants a near-opaque dark backdrop (not the standard dialog's
// light bg-black/10 overlay meant for form dialogs) and no card chrome around the viewer, so it
// portals and manages its own open/close instead of overriding Dialog's overlay styling. Escape
// and backdrop-click close, and body scroll is locked while open — the baseline a11y a real
// Dialog would otherwise give for free.
export function ImageLightbox({
  src,
  alt,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onOpenChange])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      <div className="flex h-[85vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden rounded-lg bg-background">
        <LightboxViewer src={src} alt={alt} />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Đóng"
        className="absolute top-4 right-4 text-white hover:bg-white/10 hover:text-white"
        onClick={() => onOpenChange(false)}
      >
        <X className="size-4" />
      </Button>
    </div>,
    document.body
  )
}
