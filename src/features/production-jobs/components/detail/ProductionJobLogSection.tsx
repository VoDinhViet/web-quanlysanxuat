import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — nhật ký thay đổi
// Job. `production_job_logs` đã bị xóa hẳn khỏi backend (không phải "chưa có dữ liệu" — bảng
// không còn tồn tại), nên không còn cách nào đọc log ở cấp Job qua API.
export function ProductionJobLogSection() {
  return (
    <MissingSectionAlert>
      Chưa có API lịch sử thay đổi cho Job — bảng log ở cấp Job đã bị xóa khỏi
      backend.
    </MissingSectionAlert>
  )
}
