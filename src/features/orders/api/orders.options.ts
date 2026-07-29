import { queryOptions } from "@tanstack/react-query"

import { getClientContacts } from "@/features/orders/api/server-functions/get-client-contacts.api"
import { getExchangeRate } from "@/features/orders/api/server-functions/get-exchange-rate.api"
import { getOrderStats } from "@/features/orders/api/server-functions/get-order-stats.api"
import { getOrder } from "@/features/orders/api/server-functions/get-order.api"
import { getOrders } from "@/features/orders/api/server-functions/get-orders.api"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"
import type { Currency } from "@/lib/types/order.type"

// Query key convention (see .claude/rules/architecture.md): `["orders"]` is the
// feature root, so `invalidateQueries({ queryKey: ["orders"] })` after a write
// refreshes list + stats in one call.
export const ordersQueryOptions = (search: OrdersSearchSchema) =>
  queryOptions({
    queryKey: ["orders", "list", search],
    queryFn: () => getOrders({ data: search }),
  })

export const orderStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["orders", "stats"],
    queryFn: () => getOrderStats(),
  })

export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => getOrder({ data: { orderId } }),
  })

// "Người liên hệ" picker in OrderContactSelect.tsx: contacts for whichever
// client is currently selected, fetched only when a client is picked (see
// the `enabled: !!clientId` at the call site).
export const clientContactsQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ["orders", "client-contacts", clientId],
    queryFn: () => getClientContacts({ data: { clientId } }),
  })

// Auto-fills "Tỷ giá quy đổi" in Create/UpdateOrderInfoSection.tsx when a non-VND currency
// is picked (see the `enabled: currency !== Currency.VND` at the call site).
export const exchangeRateQueryOptions = (currency: Currency) =>
  queryOptions({
    queryKey: ["orders", "exchange-rate", currency],
    queryFn: () => getExchangeRate({ data: { currency } }),
    staleTime: 60 * 60_000, // upstream refreshes ~daily; no need to refetch per render
  })
