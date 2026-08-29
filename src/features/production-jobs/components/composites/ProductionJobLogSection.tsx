import { DateTime } from "luxon"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MockDataBadge } from "@/components/shared/primitives/MockDataBadge"

type ProductionJobLogRow = {
  id: string
  at: string
  actor: string
  action: string
  content: string
}

// `production_job_logs` has been dropped entirely from the backend — there is no endpoint to
// read a Job-level audit trail from (see production-job.type.ts). These rows are a hardcoded
// placeholder so the layout can be reviewed; replace this whole component wholesale once a real
// endpoint ships. The MockDataBadge lives here (not in the shared InfoSection header) so the
// surrounding tab layout stays untouched.
const mockLogRows: ProductionJobLogRow[] = [
  {
    id: "mock-1",
    at: "2026-07-28T08:15:00.000+07:00",
    actor: "Nguyễn Văn A",
    action: "Tạo Job",
    content: "Tạo Job từ LSX đã duyệt",
  },
  {
    id: "mock-2",
    at: "2026-07-29T09:40:00.000+07:00",
    actor: "Trần Thị B",
    action: "Cập nhật ghi chú",
    content: "Bổ sung ghi chú hướng dẫn gia công",
  },
  {
    id: "mock-3",
    at: "2026-07-30T07:05:00.000+07:00",
    actor: "Nguyễn Văn A",
    action: "Bắt đầu SX",
    content: "Chuyển trạng thái Chưa SX → Đang SX",
  },
]

export function ProductionJobLogSection() {
  return (
    <div>
      <div className="flex justify-end px-4 pt-3 sm:px-5">
        <MockDataBadge />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-12 hover:bg-muted/45">
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Nội dung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogRows.map((row) => (
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
                <TableCell className="whitespace-nowrap tabular-nums">
                  {DateTime.fromISO(row.at).toFormat("dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{row.actor}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
