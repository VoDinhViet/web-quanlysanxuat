import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { ManageTable } from "@/features/manage/components/ManageTable"
import {
  OPEN_NCRS,
  OVERDUE_OUTSOURCE,
  UPCOMING_DELIVERIES,
} from "@/features/manage/mock/manage-dashboard.mock"
import {
  DO_STATUS_LABELS,
  DoStatus,
  NCR_SOURCE_LABELS,
  NCR_STATUS_LABELS,
  NcrStatus,
} from "@/features/manage/types/manage.type"
import { cn } from "@/lib/utils"

const NCR_STATUS_BADGE_CLASSNAME: Record<NcrStatus, string> = {
  [NcrStatus.REWORK]:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  [NcrStatus.SCRAP]: "bg-destructive/15 text-destructive",
  [NcrStatus.PENDING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
}

const DO_STATUS_BADGE_CLASSNAME: Record<DoStatus, string> = {
  [DoStatus.NOT_EXPORTED]: "bg-muted text-muted-foreground",
  [DoStatus.PREPARING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
}

/** Mockup row: "Gia công ngoài trễ hạn" + "NCR chưa xử lý" + "DO sắp giao". */
export function ManageOperationsRow() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <ManageTable
        title="Gia công ngoài trễ hạn"
        headers={["OS", "NCC", "Công đoạn", "Ngày hẹn", "Trễ"]}
      >
        {OVERDUE_OUTSOURCE.map((os) => (
          <TableRow key={os.osCode}>
            <TableCell className="text-xs font-medium">{os.osCode}</TableCell>
            <TableCell className="max-w-16 truncate text-xs">
              {os.supplierName}
            </TableCell>
            <TableCell className="text-xs">{os.operation}</TableCell>
            <TableCell className="text-xs">{os.dueDate}</TableCell>
            <TableCell className="text-xs text-destructive">
              {os.daysOverdue} ngày
            </TableCell>
          </TableRow>
        ))}
      </ManageTable>

      <ManageTable
        title="NCR chưa xử lý"
        headers={["NCR", "Nguồn", "Loại", "Ngày tạo", "Trạng thái"]}
      >
        {OPEN_NCRS.map((ncr) => (
          <TableRow key={ncr.ncrCode}>
            <TableCell className="text-xs font-medium">{ncr.ncrCode}</TableCell>
            <TableCell className="text-xs">
              {NCR_SOURCE_LABELS[ncr.source]}
            </TableCell>
            <TableCell className="text-xs">{ncr.type}</TableCell>
            <TableCell className="text-xs">{ncr.createdAt}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent text-[10px] font-medium",
                  NCR_STATUS_BADGE_CLASSNAME[ncr.status]
                )}
              >
                {NCR_STATUS_LABELS[ncr.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </ManageTable>

      <ManageTable
        title="DO sắp giao"
        headers={["DO", "Khách hàng", "Ngày giao", "Trạng thái"]}
      >
        {UPCOMING_DELIVERIES.map((delivery) => (
          <TableRow key={delivery.doCode}>
            <TableCell className="text-xs font-medium">
              {delivery.doCode}
            </TableCell>
            <TableCell className="max-w-28 truncate text-xs">
              {delivery.customerName}
            </TableCell>
            <TableCell className="text-xs">{delivery.deliveryDate}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent text-[10px] font-medium",
                  DO_STATUS_BADGE_CLASSNAME[delivery.status]
                )}
              >
                {DO_STATUS_LABELS[delivery.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </ManageTable>
    </div>
  )
}
