import { useEffect, useState } from "react"
import type { PointerEvent, ReactNode, WheelEvent } from "react"
import { createPortal } from "react-dom"
import {
  ExternalLink,
  RefreshCw,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MIN_SCALE = 0.5
const MAX_SCALE = 4
const SCALE_STEP = 0.25

type Offset = { x: number; y: number }

const origin: Offset = { x: 0, y: 0 }

type LightboxViewerProps = {
  src: string
  alt: string
  onClose: () => void
}

type LightboxToolButtonProps = {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function LightboxToolButton({
  label,
  disabled,
  onClick,
  children,
}: LightboxToolButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="rounded-full text-white hover:bg-white/15 hover:text-white disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function LightboxDivider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-white/20" />
}

// Zoom/rotation/pan state lives here, not in ImageLightbox itself — the dialog unmounts its
// children whenever it closes, so this component remounts fresh on every open and the state
// resets for free. The image floats straight on the dark backdrop (no card): wheel or +/- zooms,
// dragging pans, double-click toggles 100%/200%, and a floating pill holds the tools.
function LightboxViewer({ src, alt, onClose }: LightboxViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offset, setOffset] = useState<Offset>(origin)
  const [dragStart, setDragStart] = useState<Offset | null>(null)

  const zoomBy = (delta: number) =>
    setScale((value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value + delta)))

  const reset = () => {
    setScale(1)
    setRotation(0)
    setOffset(origin)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        zoomBy(SCALE_STEP)
      } else if (event.key === "-") {
        zoomBy(-SCALE_STEP)
      } else if (event.key === "0") {
        reset()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    zoomBy(event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP)
  }

  const handlePointerDown = (event: PointerEvent<HTMLImageElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y })
  }

  const handlePointerMove = (event: PointerEvent<HTMLImageElement>) => {
    if (dragStart) {
      setOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      })
    }
  }

  return (
    <>
      <div
        role="presentation"
        className="flex h-full w-full items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose()
          }
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={cn(
            "max-h-[88vh] max-w-[92vw] rounded-md object-contain shadow-2xl select-none",
            dragStart
              ? "cursor-grabbing"
              : "cursor-grab transition-transform duration-150 ease-out"
          )}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragStart(null)}
          onPointerCancel={() => setDragStart(null)}
          onDoubleClick={() => {
            setScale((value) => (value > 1 ? 1 : 2))
            setOffset(origin)
          }}
        />
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/60 px-2 py-1.5 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md">
        <LightboxToolButton
          label="Thu nhỏ"
          disabled={scale <= MIN_SCALE}
          onClick={() => zoomBy(-SCALE_STEP)}
        >
          <ZoomOut className="size-4" />
        </LightboxToolButton>
        <span className="min-w-12 text-center text-xs font-medium tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <LightboxToolButton
          label="Phóng to"
          disabled={scale >= MAX_SCALE}
          onClick={() => zoomBy(SCALE_STEP)}
        >
          <ZoomIn className="size-4" />
        </LightboxToolButton>

        <LightboxDivider />

        <LightboxToolButton
          label="Xoay trái"
          onClick={() => setRotation((value) => value - 90)}
        >
          <RotateCcw className="size-4" />
        </LightboxToolButton>
        <LightboxToolButton
          label="Xoay phải"
          onClick={() => setRotation((value) => value + 90)}
        >
          <RotateCw className="size-4" />
        </LightboxToolButton>
        <LightboxToolButton label="Đặt lại" onClick={reset}>
          <RefreshCw className="size-4" />
        </LightboxToolButton>

        <LightboxDivider />

        <LightboxToolButton
          label="Mở ảnh gốc trong tab mới"
          onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="size-4" />
        </LightboxToolButton>
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

// Full-screen preview for a single image (zoom/rotate/pan, no card chrome) — pure display, no upload/business logic,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
    >
      <LightboxViewer src={src} alt={alt} onClose={() => onOpenChange(false)} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Đóng"
        title="Đóng (Esc)"
        className="absolute top-4 right-4 rounded-full bg-black/50 text-white ring-1 ring-white/10 hover:bg-white/20 hover:text-white"
        onClick={() => onOpenChange(false)}
      >
        <X className="size-5" />
      </Button>
    </div>,
    document.body
  )
}
