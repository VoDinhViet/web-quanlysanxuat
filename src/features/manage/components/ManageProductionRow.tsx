import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TableCell, TableRow } from "@/components/ui/table"
import { ManageCardLink } from "@/features/manage/components/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/ManageCardTitle"
import { ManageProductionChart } from "@/features/manage/components/ManageProductionChart"
import { ManageTable } from "@/features/manage/components/ManageTable"
import {
  LOW_STOCK_MATERIALS,
  OVERDUE_JOBS,
} from "@/features/manage/mock/manage-dashboard.mock"
import {
  JOB_STATUS_LABELS,
  JobStatus,
} from "@/features/manage/types/manage.type"

const jobStatusBadgeVariants = cva("", {
  variants: {
    status: {
      [JobStatus.IN_PROGRESS]:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
      [JobStatus.WAITING_MATERIAL]:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
      [JobStatus.WAITING_OUTSOURCE]:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
      [JobStatus.WAITING_QC]:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
      [JobStatus.REWORK]:
        "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
      [JobStatus.COMPLETED]: "bg-success/15 text-success",
      [JobStatus.CANCELLED]: "bg-muted text-muted-foreground",
    },
  },
})

/** Mockup row: production-progress donut + "Job trễ hạn" + "Thiếu vật tư". */
export function ManageProductionRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card size="sm">
        <CardHeader>
          <ManageCardTitle>Tiến độ sản xuất (tất cả job)</ManageCardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ManageProductionChart />
          <ManageCardLink />
        </CardContent>
      </Card>

      <ManageTable
        title="Job trễ hạn"
        headers={["Job", "PO", "Ngày giao", "Trễ hạn", "Trạng thái"]}
      >
        {OVERDUE_JOBS.map((job) => (
          <TableRow key={job.jobCode}>
            <TableCell className="text-xs font-medium">{job.jobCode}</TableCell>
            <TableCell className="text-xs">{job.poCode}</TableCell>
            <TableCell className="text-xs">{job.dueDate}</TableCell>
            <TableCell className="text-xs text-destructive">
              {job.daysOverdue} ngày
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={jobStatusBadgeVariants({ status: job.status })}
              >
                {JOB_STATUS_LABELS[job.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </ManageTable>

      <ManageTable
        title="Thiếu vật tư"
        headers={["Mã vật tư", "Tên vật tư", "Thiếu", "ĐVT"]}
      >
        {LOW_STOCK_MATERIALS.map((material) => (
          <TableRow key={material.materialCode}>
            <TableCell className="text-xs font-medium">
              {material.materialCode}
            </TableCell>
            <TableCell className="text-xs">{material.materialName}</TableCell>
            <TableCell className="text-xs text-destructive">
              {material.shortage}
            </TableCell>
            <TableCell className="text-xs">{material.unit}</TableCell>
          </TableRow>
        ))}
      </ManageTable>
    </div>
  )
}
