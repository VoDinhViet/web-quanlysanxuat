import { createFileRoute } from "@tanstack/react-router"

import { ImportDirectsPage } from "@/features/directs/pages/ImportDirectsPage"

export const Route = createFileRoute("/(authed)/manage_/directs_/import/")({
  component: ImportDirectsPage,
})
