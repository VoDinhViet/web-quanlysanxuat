import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
// Search schema for the payment-requests list page.
// Field names follow the same conventions as purchase-orders-search.schema.ts.
export const paymentRequestsSearchSchema = z.object({
  ...paginationSearchFields(),
  // Mã YCTT / Mã PO keyword
  q: z.string().trim().min(1).optional().catch(undefined),
  // Filter by supplier
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  // Filter by PO code (plain string, not an id — matches the mockup filter)
  poCode: z.string().trim().min(1).optional().catch(undefined),
  // Status filter
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional().catch(undefined),
  // Date range (ISO yyyy-MM-dd) — matches the "Từ ngày / Đến ngày" DateRangePicker pair
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type PaymentRequestsSearchSchema = z.infer<
  typeof paymentRequestsSearchSchema
>
