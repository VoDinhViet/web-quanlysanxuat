import { createFileRoute } from "@tanstack/react-router"

import { CreateStandaloneOutsourcingOrderPage } from "@/features/outsourcing-orders/pages/CreateStandaloneOutsourcingOrderPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-orders_/create-standalone"
)({
  component: CreateStandaloneOutsourcingOrderPage,
})
