import { queryOptions } from "@tanstack/react-query"

import { getPurchaseRequestRelatedNotes } from "@/features/purchase-requests/api/server-functions/get-purchase-request-related-notes.api"

export const purchaseRequestRelatedNotesQueryOptions = (
  purchaseRequestId: string
) =>
  queryOptions({
    queryKey: ["purchase-requests", "related-notes", purchaseRequestId],
    queryFn: () =>
      getPurchaseRequestRelatedNotes({ data: { purchaseRequestId } }),
  })
