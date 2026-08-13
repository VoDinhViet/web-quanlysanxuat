import { queryOptions } from "@tanstack/react-query"

import {
  getMockPaymentRequests,
  getMockPaymentRequest,
} from "@/features/payment-requests/mock/payment-requests.mock"
import type { PaymentRequest, PaymentRequestDetail } from "@/lib/types/payment-request.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { PaymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"

// List query — keyed on the full search object so any filter/page change
// triggers a new fetch (same pattern as purchaseOrdersQueryOptions).
export const paymentRequestsQueryOptions = (
  search: PaymentRequestsSearchSchema
) =>
  queryOptions<PaginatedResponse<PaymentRequest>>({
    queryKey: ["payment-requests", "list", search],
    // Fake async — simulates a network round-trip without a real HTTP call.
    queryFn: () =>
      new Promise<PaginatedResponse<PaymentRequest>>((resolve) =>
        setTimeout(() => resolve(getMockPaymentRequests(search)), 120)
      ),
  })

// Detail query — keyed on the record id.
export const paymentRequestQueryOptions = (id: string) =>
  queryOptions<PaymentRequestDetail>({
    queryKey: ["payment-requests", "detail", id],
    queryFn: () =>
      new Promise<PaymentRequestDetail>((resolve, reject) =>
        setTimeout(() => {
          const detail = getMockPaymentRequest(id)
          if (!detail) {
            reject(new Error("Không tìm thấy yêu cầu thanh toán."))
          } else {
            resolve(detail)
          }
        }, 120)
      ),
  })
