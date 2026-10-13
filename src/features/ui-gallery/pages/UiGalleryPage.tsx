import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { GalleryActionsSection } from "@/features/ui-gallery/components/GalleryActionsSection"
import { GalleryDataSection } from "@/features/ui-gallery/components/GalleryDataSection"
import { GalleryFormSection } from "@/features/ui-gallery/components/GalleryFormSection"
import { GalleryOverlaySection } from "@/features/ui-gallery/components/GalleryOverlaySection"
import { GalleryTokensSection } from "@/features/ui-gallery/components/GalleryTokensSection"

const sectionLinks = [
  { id: "tokens", label: "Token" },
  { id: "actions", label: "Nút & nhãn" },
  { id: "form", label: "Biểu mẫu" },
  { id: "overlays", label: "Lớp phủ" },
  { id: "data", label: "Dữ liệu" },
]

// Hidden page (no sidebar entry) — reach it by URL to eyeball every `components/ui` primitive.
export function UiGalleryPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="UI Gallery"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "UI Gallery" },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <nav className="flex flex-wrap gap-2 text-xs">
          {sectionLinks.map((sectionLink) => (
            <a
              key={sectionLink.id}
              href={`#${sectionLink.id}`}
              className="rounded-md bg-card px-3 py-1.5 font-medium text-muted-foreground shadow-card hover:text-foreground"
            >
              {sectionLink.label}
            </a>
          ))}
        </nav>

        <GalleryTokensSection />
        <GalleryActionsSection />
        <GalleryFormSection />
        <GalleryOverlaySection />
        <GalleryDataSection />
      </div>
    </main>
  )
}
