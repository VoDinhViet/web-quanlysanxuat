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
    queryFn: () => getProductLedger({ data: { itemId, ...search } }),
  })
