import { queryOptions } from "@tanstack/react-query"

import {
  getMockOutboundOrder,
  getMockOutboundOrders,
} from "@/features/outbound-orders/mock/outbound-orders.mock"
import type {
  OutboundOrder,
  OutboundOrderDetail,
} from "@/lib/types/outbound-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { OutboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"

export const outboundOrdersQueryOptions = (
  search: OutboundOrdersSearchSchema
) =>
  queryOptions<PaginatedResponse<OutboundOrder>>({
    queryKey: ["outbound-orders", "list", search],
    queryFn: () =>
      new Promise<PaginatedResponse<OutboundOrder>>((resolve) =>
        setTimeout(() => resolve(getMockOutboundOrders(search)), 120)
      ),
  })

export const outboundOrderQueryOptions = (id: string) =>
  queryOptions<OutboundOrderDetail>({
    queryKey: ["outbound-orders", "detail", id],
    queryFn: () =>
      new Promise<OutboundOrderDetail>((resolve, reject) =>
        setTimeout(() => {
          const detail = getMockOutboundOrder(id)
          if (!detail) {
            reject(new Error("Không tìm thấy thông tin đơn giao hàng."))
          } else {
            resolve(detail)
          }
        }, 120)
      ),
  })
