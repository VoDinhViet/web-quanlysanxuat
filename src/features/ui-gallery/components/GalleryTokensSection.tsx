import {
  GalleryRow,
  GallerySection,
} from "@/features/ui-gallery/components/GallerySection"

type TokenSwatch = {
  token: string
  className: string
}

const colorSwatches: TokenSwatch[] = [
  { token: "background", className: "bg-background" },
  { token: "card", className: "bg-card" },
  { token: "primary", className: "bg-primary" },
  { token: "secondary", className: "bg-secondary" },
  { token: "muted", className: "bg-muted" },
  { token: "accent", className: "bg-accent" },
  { token: "border", className: "bg-border" },
  { token: "destructive", className: "bg-destructive" },
  { token: "success", className: "bg-success" },
  { token: "warning", className: "bg-warning" },
  { token: "info", className: "bg-info" },
  { token: "sidebar", className: "bg-sidebar" },
  { token: "chart-1", className: "bg-chart-1" },
  { token: "chart-2", className: "bg-chart-2" },
  { token: "chart-3", className: "bg-chart-3" },
  { token: "chart-4", className: "bg-chart-4" },
  { token: "chart-5", className: "bg-chart-5" },
  { token: "chart-6", className: "bg-chart-6" },
  { token: "chart-7", className: "bg-chart-7" },
]

const radiusSwatches: TokenSwatch[] = [
  { token: "rounded-sm", className: "rounded-sm" },
  { token: "rounded-md", className: "rounded-md" },
  { token: "rounded-lg", className: "rounded-lg" },
  { token: "rounded-xl", className: "rounded-xl" },
  { token: "rounded-2xl", className: "rounded-2xl" },
]

const shadowSwatches: TokenSwatch[] = [
  { token: "shadow-card", className: "shadow-card" },
  { token: "shadow-popover", className: "shadow-popover" },
]

const typeSamples: TokenSwatch[] = [
  { token: "font-heading · text-2xl", className: "font-heading text-2xl" },
  { token: "font-heading · text-lg", className: "font-heading text-lg" },
  { token: "font-sans · text-base", className: "text-base" },
  { token: "font-sans · text-sm", className: "text-sm" },
  { token: "font-sans · text-xs", className: "text-xs" },
  { token: "font-mono · mã chứng từ", className: "font-mono text-sm" },
]

export function GalleryTokensSection() {
  return (
    <GallerySection
      id="tokens"
      title="Token"
      description="Màu, bo góc, đổ bóng và chữ — nguồn: src/styles.css"
    >
      <GalleryRow label="Màu">
        {colorSwatches.map((swatch) => (
          <div key={swatch.token} className="flex w-24 flex-col gap-1.5">
            <div
              className={`h-12 rounded-md border border-border ${swatch.className}`}
            />
            <span className="text-xs text-muted-foreground">
              {swatch.token}
            </span>
          </div>
        ))}
      </GalleryRow>

      <GalleryRow label="Bo góc">
        {radiusSwatches.map((swatch) => (
          <div key={swatch.token} className="flex w-24 flex-col gap-1.5">
            <div
              className={`h-12 border border-border bg-muted ${swatch.className}`}
            />
            <span className="text-xs text-muted-foreground">
              {swatch.token}
            </span>
          </div>
        ))}
      </GalleryRow>

      <GalleryRow label="Đổ bóng">
        {shadowSwatches.map((swatch) => (
          <div key={swatch.token} className="flex w-32 flex-col gap-1.5">
            <div className={`h-12 rounded-lg bg-card ${swatch.className}`} />
            <span className="text-xs text-muted-foreground">
              {swatch.token}
            </span>
          </div>
        ))}
      </GalleryRow>

      <GalleryRow label="Chữ">
        <div className="flex flex-col gap-2">
          {typeSamples.map((sample) => (
            <div key={sample.token} className="flex items-baseline gap-4">
              <span className="w-48 text-xs text-muted-foreground">
                {sample.token}
              </span>
              <span className={sample.className}>
                Cơ khí Tiến Huy — NCR-2026-00001
              </span>
            </div>
          ))}
        </div>
      </GalleryRow>
    </GallerySection>
  )
}
