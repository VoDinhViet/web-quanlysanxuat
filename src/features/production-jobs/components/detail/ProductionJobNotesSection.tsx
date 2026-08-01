import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — ghi chú Job. Backend
// không có endpoint nào cho việc này — xem production-job.type.ts.
export function ProductionJobNotesSection() {
  return (
    <MissingSectionAlert>
      Chưa có API ghi chú cho Job — backend hiện không có endpoint nào để
      đọc/ghi ghi chú ở cấp Job.
    </MissingSectionAlert>
  )
}
