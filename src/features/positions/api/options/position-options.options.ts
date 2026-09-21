import { queryOptions } from "@tanstack/react-query"

import { getPositions } from "@/features/positions/api/server-functions/get-positions.api"

// BE `ensurePositionInDepartment` bắt buộc chức vụ phải thuộc đúng phòng ban đã chọn — lọc
// ngay từ nguồn thay vì tải hết rồi lọc phía client, tránh dính trần `limit: 100` toàn bộ chức vụ.
export const positionOptionsQueryOptions = (departmentId: string) =>
  queryOptions({
    queryKey: ["positions", "options", departmentId],
    queryFn: () => getPositions({ data: { departmentId } }),
    staleTime: 5 * 60_000,
  })
