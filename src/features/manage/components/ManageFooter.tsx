import { DateTime } from "luxon"
import { RefreshCw } from "lucide-react"

import { LAST_UPDATED_AT } from "@/features/manage/mock/manage-dashboard.mock"

export function ManageFooter() {
  return (
    <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
      <RefreshCw className="size-3.5" />
      Dữ liệu cập nhật lần cuối:{" "}
      {DateTime.fromISO(LAST_UPDATED_AT).toFormat("dd/MM/yyyy HH:mm:ss")}
    </div>
  )
}
