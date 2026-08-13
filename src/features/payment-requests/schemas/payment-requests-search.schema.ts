import { z } from "zod"

// Search schema for the payment-requests list page.
// Field names follow the same conventions as purchase-orders-search.schema.ts.
export const paymentRequestsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  // Mã YCTT / Mã PO keyword
  q: z.string().trim().min(1).optional().catch(undefined),
  // Filter by supplier
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  // Filter by PO code (plain string, not an id — matches the mockup filter)
  poCode: z.string().trim().min(1).optional().catch(undefined),
  // Status filter
  status: z
    .enum(["PENDING", "PAID", "CANCELLED"])
    .optional()
    .catch(undefined),
  // Date range (ISO yyyy-MM-dd) — matches the "Từ ngày / Đến ngày" DateRangePicker pair
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type PaymentRequestsSearchSchema = z.infer<
  typeof paymentRequestsSearchSchema
>
