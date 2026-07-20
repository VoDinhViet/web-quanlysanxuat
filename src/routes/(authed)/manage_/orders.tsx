import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { OrdersPage } from "@/features/orders/pages/OrdersPage"
import {
  orderStatsQueryOptions,
  ordersQueryOptions,
  salesRepOptionsQueryOptions,
} from "@/features/orders/orders.query"
import { ordersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/orders")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:read"),
  validateSearch: ordersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(ordersQueryOptions(deps)),
      context.queryClient.ensureQueryData(orderStatsQueryOptions()),
      context.queryClient.ensureQueryData(salesRepOptionsQueryOptions()),
    ]),
  component: OrdersPage,
})
