import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { UiGalleryPage } from "@/features/ui-gallery/pages/UiGalleryPage"

export const Route = createFileRoute("/(authed)/ui-gallery")({
  component: UiGalleryPage,
  pendingComponent: LayoutPagePending,
})
