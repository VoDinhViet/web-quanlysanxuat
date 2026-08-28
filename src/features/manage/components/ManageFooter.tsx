import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { RefreshCw } from "lucide-react"

import { reportStatsQueryOptions } from "@/features/reports/api"

export function ManageFooter() {
  // Mượn mốc thời gian fetch xong của reportStats (query đầu tiên/chính của trang, cũng là query
  // mọi component khác dùng chung React Query cache) làm "cập nhật lần cuối" — không cần endpoint
  // riêng.
  const statsQuery = useQuery(reportStatsQueryOptions())

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
      <RefreshCw className="size-3.5" />
      Dữ liệu cập nhật lần cuối:{" "}
      {statsQuery.dataUpdatedAt
        ? DateTime.fromMillis(statsQuery.dataUpdatedAt).toFormat(
            "dd/MM/yyyy HH:mm:ss"
          )
        : "—"}
    </div>
  )
}
