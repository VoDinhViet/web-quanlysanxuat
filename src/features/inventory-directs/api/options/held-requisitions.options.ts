import { queryOptions } from "@tanstack/react-query"

import { getHeldRequisitions } from "@/features/inventory-directs/api/server-functions/get-held-requisitions.api"
import type { HeldRequisitionsSearch } from "@/lib/types/held-requisition.type"

export const heldRequisitionsQueryOptions = (
  itemId: string,
  search: HeldRequisitionsSearch
) =>
  queryOptions({
    queryKey: ["inventory-directs", "held-requisitions", itemId, search],
    // Duyệt hoặc xuất kho một phiếu làm đổi danh sách giữ: luôn revalidate khi mở lại.
    staleTime: 0,
    queryFn: () => getHeldRequisitions({ data: { itemId, ...search } }),
  })
