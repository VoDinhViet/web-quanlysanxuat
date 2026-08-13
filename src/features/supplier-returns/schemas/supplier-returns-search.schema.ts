import { z } from "zod"

import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"

// Mirrors the backend's GetSupplierReturnsReqDto (GET /api/supplier-returns). Every optional
// field carries `.catch(undefined)` so a hand-mangled URL degrades gracefully instead of taking
// the route down. Three DTO fields are deliberately not here:
// - `q` — the service only runs it against `supplierReturns.code` (unaccentILike), and the
//   mockup's "Tìm kiếm vật tư" box searches material name/code instead, which is `materialKeyword`.
// - `order` — PageOptionsDto accepts it but the service hardcodes
//   `orderBy: desc(supplierReturns.createdAt)`, same as inventory-materials-search.schema.ts.
// - `nkCode` — no "Mã NK" column exists on this list anymore (moved to the detail page, see
//   SupplierReturnsTableColumns.tsx), so filtering by it would match rows with no visible reason.
export const supplierReturnsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  materialKeyword: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  poCode: z.string().trim().min(1).optional().catch(undefined),
  iqcCode: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(InventoryDocumentStatus).optional().catch(undefined),
})

export type SupplierReturnsSearchSchema = z.infer<
  typeof supplierReturnsSearchSchema
>
