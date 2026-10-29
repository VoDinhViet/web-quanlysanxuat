import { useQuery } from "@tanstack/react-query"
import { addDays, format } from "date-fns"

import { outboundOrdersQueryOptions } from "@/features/outbound-orders/api"
import { vnZone } from "@/lib/time"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"

const UPCOMING_WINDOW_DAYS = 3

// Export riêng để route loader (manage.tsx) prefetch đúng query key này — không tự tính lại
// tham số ở loader.
export function upcomingDeliveriesQueryOptions() {
  const today = vnZone(Date.now())
  const windowEnd = addDays(today, UPCOMING_WINDOW_DAYS)

  return outboundOrdersQueryOptions({
    page: 1,
    limit: 50,
    status: OutboundOrderStatus.PENDING_DELIVERY,
    startDate: format(today, "yyyy-MM-dd"),
    endDate: format(windowEnd, "yyyy-MM-dd"),
  })
}

// "DO sắp giao" — điều kiện lọc hoàn toàn ở server (status + khoảng ngày), khác 2 hook
// "trễ hạn" kia: `total` ở đây là số chính xác, không bị giới hạn top-50. BE cố định
// `ORDER BY createdAt DESC` nên vẫn tự sort lại theo `fulfillmentDate` để hiện đơn giao sớm
// nhất trước.
export function useUpcomingDeliveries() {
  const query = useQuery(upcomingDeliveriesQueryOptions())

  const sorted = [...(query.data?.data ?? [])].sort((a, b) =>
    a.fulfillmentDate.localeCompare(b.fulfillmentDate)
  )

  return {
    top5: sorted.slice(0, 5),
    total: query.data?.pagination.totalRecords ?? 0,
    isPending: query.isPending,
    isError: query.isError,
  }
}
