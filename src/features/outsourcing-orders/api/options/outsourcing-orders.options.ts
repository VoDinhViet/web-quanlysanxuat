import { queryOptions } from "@tanstack/react-query"

import { getMockOutsourcingOrders } from "@/features/outsourcing-orders/mock/outsourcing-orders.mock"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { OutsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"

// No backend API exists for this domain yet — queryFn resolves from static mock data (see
// outsourcing-orders.mock.ts) behind the same queryOptions-factory shape as every other list,
// so the page and its loader don't need to know the data isn't real yet.
export const outsourcingOrdersQueryOptions = (
  search: OutsourcingOrdersSearchSchema
) =>
  queryOptions<PaginatedResponse<OutsourcingOrder>>({
    queryKey: ["outsourcing-orders", "list", search],
    queryFn: () =>
      new Promise<PaginatedResponse<OutsourcingOrder>>((resolve) =>
        setTimeout(() => resolve(getMockOutsourcingOrders(search)), 120)
      ),
  })
