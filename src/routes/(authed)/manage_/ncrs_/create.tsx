import { createFileRoute } from "@tanstack/react-router"

import { NcrCreatePage } from "@/features/ncrs/pages/NcrCreatePage"

// No loader: the pickers are small searchable queries inside the form.
export const Route = createFileRoute("/(authed)/manage_/ncrs_/create")({
  component: NcrCreatePage,
})
