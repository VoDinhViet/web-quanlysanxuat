import { z } from "zod"

import {
  AssetType,
  InventoryReceiptSource,
  InventoryReceiptStatus,
} from "@/lib/types/inventory-receipt.type"

export const inventoryReceiptsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  source: z.enum(InventoryReceiptSource).optional().catch(undefined),
  assetType: z.enum(AssetType).optional().catch(undefined),
  status: z.enum(InventoryReceiptStatus).optional().catch(undefined),
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type InventoryReceiptsSearchSchema = z.infer<
  typeof inventoryReceiptsSearchSchema
>
