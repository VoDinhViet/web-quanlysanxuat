import { Factory } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"

// No action button — a Job is created automatically when its LSX (production order) is approved,
// never by hand from this screen.
export function ProductionJobsEmptyState() {
  return (
    <TableEmptyState
      icon={Factory}
      title="Chưa có Job nào"
      description="Job được tạo tự động khi Lệnh sản xuất (LSX) được duyệt."
    />
  )
}
