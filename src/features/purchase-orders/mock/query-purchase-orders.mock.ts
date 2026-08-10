import { MOCK_PURCHASE_ORDER_ROWS } from "@/features/purchase-orders/mock/purchase-orders-rows.mock"
import type { PurchaseOrdersSearchSchema } from "@/features/purchase-orders/schemas/purchase-orders-search.schema"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { PurchaseOrderRow } from "@/lib/types/purchase-order.type"

function matchesSearch(row: PurchaseOrderRow, q: string): boolean {
  const term = q.toLowerCase()
  return (
    row.code.toLowerCase().includes(term) ||
    row.supplier.name.toLowerCase().includes(term) ||
    row.purchaseRequests.some((ref) => ref.code.toLowerCase().includes(term)) ||
    row.quotations.some((ref) => ref.code.toLowerCase().includes(term))
  )
}

// Mirrors the shape a real GET /purchase-orders would return — client-side filter/paginate over
// the seeded rows, same idiom the deleted purchase-ledger mock query used before its API landed.
export function queryPurchaseOrders(
  search: PurchaseOrdersSearchSchema
): PaginatedResponse<PurchaseOrderRow> {
  const filtered = MOCK_PURCHASE_ORDER_ROWS.filter((row) => {
    if (search.q && !matchesSearch(row, search.q)) return false
    if (search.status && row.progress !== search.status) return false
    if (search.supplierId && row.supplier.id !== search.supplierId) return false
    if (search.orderDateFrom && row.orderDate < search.orderDateFrom)
      return false
    if (search.orderDateTo && row.orderDate > search.orderDateTo) return false
    return true
  })

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / search.limit))
  const currentPage = Math.min(search.page, totalPages)
  const start = (currentPage - 1) * search.limit
  const data = filtered.slice(start, start + search.limit)

  return {
    data,
    pagination: {
      limit: search.limit,
      currentPage,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      totalRecords,
      totalPages,
    },
  }
}
