import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — tài liệu đính kèm
// Job. Backend không có endpoint nào cho việc này (không phải "chưa upload", mà là chưa có API
// nào trả/nhận tài liệu ở cấp Job) — xem production-job.type.ts.
export function ProductionJobDocumentsSection() {
  return (
    <MissingSectionAlert>
      Chưa có API tài liệu đính kèm cho Job — backend hiện không có endpoint nào
      để đọc/tải lên tài liệu ở cấp Job.
    </MissingSectionAlert>
  )
}
