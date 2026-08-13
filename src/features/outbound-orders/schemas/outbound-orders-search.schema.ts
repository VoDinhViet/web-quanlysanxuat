import { z } from "zod"

import {
  OutboundDeliveryMethod,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"

export const outboundOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã DO
  clientName: z.string().trim().min(1).optional().catch(undefined), // Khách hàng
  poCode: z.string().trim().min(1).optional().catch(undefined), // PO / Lý do
  status: z.enum(OutboundOrderStatus).optional().catch(undefined), // Trạng thái
  deliveryMethod: z.enum(OutboundDeliveryMethod).optional().catch(undefined), // Hình thức giao
  productCode: z.string().trim().min(1).optional().catch(undefined), // Mã sản phẩm
  productName: z.string().trim().min(1).optional().catch(undefined), // Tên sản phẩm
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type OutboundOrdersSearchSchema = z.infer<
  typeof outboundOrdersSearchSchema
>
