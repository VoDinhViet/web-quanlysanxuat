import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateOrderPage } from "@/features/orders/pages/CreateOrderPage"

// No loader: every picker here (client, product, sales rep) is an
// async-search combobox/select backed by a plain useQuery, and payment
// term/currency/discount type are static enums — nothing to prefetch.
export const Route = createFileRoute("/(authed)/manage_/orders_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:create"),
  component: CreateOrderPage,
})
