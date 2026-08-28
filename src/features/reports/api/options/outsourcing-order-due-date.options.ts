import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingOrderDueDate } from "@/features/reports/api/server-functions/get-outsourcing-order-due-date.api"

export const outsourcingOrderDueDateQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "outsourcing-order-due-date"],
    queryFn: () => getOutsourcingOrderDueDate(),
  })
