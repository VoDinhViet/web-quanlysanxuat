import { queryOptions } from "@tanstack/react-query"

import { getProductLedger } from "@/features/inventory-products/api/server-functions/get-product-ledger.api"

export type ProductLedgerSearch = {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

// The stock-card ledger ("Thẻ kho thành phẩm") tab — one item's transaction history, filterable
// by date range and paginated independently of the detail route's own loader-prefetched reads.
export const productLedgerQueryOptions = (
  itemId: string,
  search: ProductLedgerSearch
) =>
  queryOptions({
    queryKey: ["inventory-products", "ledger", itemId, search],
    // Fast-moving tier (see src/router.tsx): stock ledger — always revalidate on mount.
    staleTime: 0,
    queryFn: () => getProductLedger({ data: { itemId, ...search } }),
  })
