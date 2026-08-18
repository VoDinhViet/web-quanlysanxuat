import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// Tra cứu lại UnfulfilledOrderItem theo orderItemId từ cache React Query của GET
// /outbound-orders/unfulfilled-order-items thay vì lưu snapshot của dòng vào item value (xem
// create-outbound-order.schema.ts) — một dòng chỉ chọn được sau khi đã hiện ra ở bước ① nên chắc
// chắn còn trong cache khi bước ②/③ cần đọc lại. `getQueriesData` khớp theo tiền tố key, quét mọi
// trang/limit đã fetch trong phiên tạo phiếu. Trả về hàm ổn định (useCallback, phụ thuộc
// `queryClient` — bản thân nó không đổi trong suốt vòng đời app) để dùng an toàn làm dependency
// của các `useMemo` dựng cột bảng.
export function useUnfulfilledOrderItemLookup() {
  const queryClient = useQueryClient()

  return useCallback(
    (orderItemId: string): UnfulfilledOrderItem | undefined => {
      const cachedQueries = queryClient.getQueriesData<
        PaginatedResponse<UnfulfilledOrderItem>
      >({ queryKey: ["outbound-orders", "unfulfilled-order-items"] })

      for (const [, page] of cachedQueries) {
        const found = page?.data.find((row) => row.orderItemId === orderItemId)
        if (found) return found
      }

      return undefined
    },
    [queryClient]
  )
}
