import { queryOptions } from "@tanstack/react-query"

import {
  getMockInventoryReceipt,
  getMockInventoryReceipts,
} from "@/features/inventory-receipts/mock/inventory-receipts.mock"
import type {
  InventoryReceipt,
  InventoryReceiptDetail,
} from "@/lib/types/inventory-receipt.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { InventoryReceiptsSearchSchema } from "@/features/inventory-receipts/schemas/inventory-receipts-search.schema"

export const inventoryReceiptsQueryOptions = (
  search: InventoryReceiptsSearchSchema
) =>
  queryOptions<PaginatedResponse<InventoryReceipt>>({
    queryKey: ["inventory-receipts", "list", search],
    queryFn: () =>
      new Promise<PaginatedResponse<InventoryReceipt>>((resolve) =>
        setTimeout(() => resolve(getMockInventoryReceipts(search)), 120)
      ),
  })

export const inventoryReceiptQueryOptions = (id: string) =>
  queryOptions<InventoryReceiptDetail>({
    queryKey: ["inventory-receipts", "detail", id],
    queryFn: () =>
      new Promise<InventoryReceiptDetail>((resolve, reject) =>
        setTimeout(() => {
          const detail = getMockInventoryReceipt(id)
          if (!detail) {
            reject(new Error("Không tìm thấy phiếu nhập kho."))
          } else {
            resolve(detail)
          }
        }, 120)
      ),
  })
