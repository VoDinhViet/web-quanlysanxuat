import { queryOptions } from "@tanstack/react-query"

import { getInventoryReceiptRelatedNotes } from "@/features/inventory-receipts/api/server-functions/get-inventory-receipt-related-notes.api"

export const inventoryReceiptRelatedNotesQueryOptions = (receiptId: string) =>
  queryOptions({
    queryKey: ["inventory-receipts", "related-notes", receiptId],
    queryFn: () => getInventoryReceiptRelatedNotes({ data: { receiptId } }),
  })
