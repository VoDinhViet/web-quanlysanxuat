import { queryOptions } from "@tanstack/react-query"

import { getPurchaseQuotationRelatedNotes } from "@/features/purchase-quotations/api/server-functions/get-purchase-quotation-related-notes.api"

export const purchaseQuotationRelatedNotesQueryOptions = (
  purchaseQuotationId: string
) =>
  queryOptions({
    queryKey: ["purchase-quotations", "related-notes", purchaseQuotationId],
    queryFn: () =>
      getPurchaseQuotationRelatedNotes({ data: { purchaseQuotationId } }),
  })
