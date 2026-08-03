import { queryOptions } from "@tanstack/react-query"

import { getExchangeRate } from "@/features/orders/api/server-functions/get-exchange-rate.api"
import type { Currency } from "@/lib/types/order.type"

// Auto-fills "Tỷ giá quy đổi" in Create/UpdateOrderInfoSection.tsx when a non-VND currency
// is picked (see the `enabled: currency !== Currency.VND` at the call site).
export const exchangeRateQueryOptions = (currency: Currency) =>
  queryOptions({
    queryKey: ["orders", "exchange-rate", currency],
    queryFn: () => getExchangeRate({ data: { currency } }),
    staleTime: 60 * 60_000, // upstream refreshes ~daily; no need to refetch per render
  })
