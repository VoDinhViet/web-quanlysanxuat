import { queryOptions } from "@tanstack/react-query"

import { getInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/get-inventory-receipt.api"

export const inventoryReceiptQueryOptions = (receiptId: string) =>
  queryOptions({
    queryKey: ["inventory-receipts", "detail", receiptId],
    queryFn: () => getInventoryReceipt({ data: { receiptId } }),
  })
