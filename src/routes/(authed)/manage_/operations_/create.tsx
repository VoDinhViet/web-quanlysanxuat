import { createFileRoute } from "@tanstack/react-router"

import { CreateOperationPage } from "@/features/operations/pages/CreateOperationPage"

// No loader: the form's static option lists (type/status) come from the shared enum labels,
// nothing to prefetch.
export const Route = createFileRoute("/(authed)/manage_/operations_/create")({
  component: CreateOperationPage,
})
