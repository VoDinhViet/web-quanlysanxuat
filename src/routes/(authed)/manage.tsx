import { createFileRoute } from "@tanstack/react-router"

import { ManagePage } from "@/features/manage/pages/ManagePage"

export const Route = createFileRoute("/(authed)/manage")({
  component: ManagePage,
})
