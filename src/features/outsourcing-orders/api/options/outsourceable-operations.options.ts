import { queryOptions } from "@tanstack/react-query"

import { getMockOutsourceableOperations } from "@/features/outsourcing-orders/mock/outsourceable-operations.mock"
import type { GetMockOutsourceableOperationsParams } from "@/features/outsourcing-orders/mock/outsourceable-operations.mock"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// No backend API exists for this endpoint yet (see outsourcing-orders.options.ts) — queryFn
// resolves from static mock data behind the same queryOptions-factory shape, so the create
// wizard's picker doesn't need to know the data isn't real yet.
export const outsourceableOperationsQueryOptions = (
  params: GetMockOutsourceableOperationsParams
) =>
  queryOptions<PaginatedResponse<OutsourceableOperation>>({
    queryKey: ["outsourcing-orders", "outsourceable-operations", params],
    queryFn: () =>
      new Promise<PaginatedResponse<OutsourceableOperation>>((resolve) =>
        setTimeout(() => resolve(getMockOutsourceableOperations(params)), 120)
      ),
  })
