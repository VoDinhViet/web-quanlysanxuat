import { queryOptions } from "@tanstack/react-query"

import { getRequisitionLines } from "@/features/inventory-requisitions/api/server-functions/get-requisition-lines.api"

type RequisitionLinesParams = {
  productionJobId?: string
  page: number
  limit: number
  q?: string
}

// Popup chọn vật tư (bước ② của cả 2 luồng tạo phiếu) — nằm dưới root key
// ["inventory-requisitions"] nên mọi invalidateQueries({queryKey:["inventory-requisitions"]}) sau
// khi Duyệt/Xuất kho cũng làm mới "Đã giữ"/"Có thể lãnh" ở đây.
export const requisitionLinesQueryOptions = (params: RequisitionLinesParams) =>
  queryOptions({
    queryKey: ["inventory-requisitions", "lines", params],
    queryFn: () => getRequisitionLines({ data: params }),
  })
