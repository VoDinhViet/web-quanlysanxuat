import { z } from "zod"

import { SupplierStatus } from "@/lib/types/supplier.type"

// Mirrors the backend's GetSuppliersReqDto (page, limit, q, order inherited from
// PageOptionsDto; status/supplierGroupId are supplier-specific filters).
// Note: the backend accepts `order` but currently ignores it server-side (always sorts
// newest-first) — harmless to keep sending, just don't expect it to change results.
// No `countryId` — the table has no country column, so filtering by it would match rows with no
// visible reason (the DTO still accepts it server-side, this frontend just stopped sending it).
export const suppliersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(SupplierStatus).optional().catch(undefined),
  supplierGroupId: z.string().trim().min(1).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type SuppliersSearchSchema = z.infer<typeof suppliersSearchSchema>
