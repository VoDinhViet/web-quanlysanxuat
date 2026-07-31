import { DateTime } from "luxon"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import type { ProductionJobMockLog } from "@/lib/types/production-job.type"

type ProductionJobLogSectionProps = {
  logs: ProductionJobMockLog[]
}

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — nhật ký thay đổi
// của Job, cùng bố cục cột với ProductionOrderLogsCard.tsx (Thời gian/Người thực hiện/Hành động/
// Nội dung) nhưng không phân trang: đây là mock tĩnh, chưa có GET /production-jobs/:jobId/logs.
// No outer card wrapper — `Table` already self-wraps in `overflow-x-auto` (ui/table.tsx), and the
// section it's embedded in supplies the surrounding panel, so the table just flows edge-to-edge
// like ProductionOrderLogsCard's own table does.
export function ProductionJobLogSection({
  logs,
}: ProductionJobLogSectionProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
          <TableHead className="font-bold text-foreground">Thời gian</TableHead>
          <TableHead className="font-bold text-foreground">
            Người thực hiện
          </TableHead>
          <TableHead className="font-bold text-foreground">Hành động</TableHead>
          <TableHead className="font-bold text-foreground">Nội dung</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableEmptyRow colSpan={4} message="Chưa có dữ liệu lịch sử." />
        ) : (
          logs.map((log) => (
            <TableRow key={log.id} className="h-14 bg-card hover:bg-muted/20">
              <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                {DateTime.fromISO(log.performedAt).toFormat("dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {log.actorName}
              </TableCell>
              <TableCell className="text-foreground">{log.action}</TableCell>
              <TableCell className="text-muted-foreground">
                {log.content}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
