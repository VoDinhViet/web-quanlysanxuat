import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import {
  InventoryReceiptStatus,
  InventoryReceiptType,
} from "@/lib/types/inventory-receipt.type"

export const inventoryReceiptsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  warehouseId: z.string().trim().min(1).optional().catch(undefined),
  receiptType: z.enum(InventoryReceiptType).optional().catch(undefined),
  status: z.enum(InventoryReceiptStatus).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  productionOrderId: z.string().trim().min(1).optional().catch(undefined),
  purchaseOrderId: z.string().trim().min(1).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type InventoryReceiptsSearchSchema = z.infer<
  typeof inventoryReceiptsSearchSchema
>
