import { queryOptions } from "@tanstack/react-query"

import { getPurchaseOrderRelatedNotes } from "@/features/purchase-orders/api/server-functions/get-purchase-order-related-notes.api"

export const purchaseOrderRelatedNotesQueryOptions = (
  purchaseOrderId: string
) =>
  queryOptions({
    queryKey: ["purchase-orders", "related-notes", purchaseOrderId],
    queryFn: () =>
      getPurchaseOrderRelatedNotes({ data: { purchaseOrderId } }),
  })
