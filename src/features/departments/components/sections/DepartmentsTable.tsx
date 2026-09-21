import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Building, Plus } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { Pagination } from "@/components/shared/composites/Pagination"
import { useRoutePagination } from "@/hooks/use-route-pagination"
import { CreateDepartmentDialog } from "@/features/departments/components/composites/CreateDepartmentDialog"
import { departmentColumns } from "@/features/departments/components/composites/DepartmentsTableColumns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Department } from "@/lib/types/department.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type DepartmentsTableProps = {
  rows: Department[]
  pagination: PaginationMeta
  isPending: boolean
}

export function DepartmentsTable({
  rows,
  pagination,
  isPending,
}: DepartmentsTableProps) {
  const table = useTable({
    data: rows,
    columns: departmentColumns,
    features: appTableFeatures,
  })

  const { onPageChange, onPageSizeChange } = useRoutePagination()

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {rows.length === 0 ? (
        <TableEmpty
          icon={Building}
          title="Chưa có phòng ban nào"
          description="Bắt đầu bằng cách thêm phòng ban đầu tiên vào tổ chức của bạn."
          action={
            <PermissionGate permission="departments:create">
              <CreateDepartmentDialog
                trigger={
                  <Button size="sm" className="text-xs">
                    <Plus className="size-4" />
                    Thêm phòng ban
                  </Button>
                }
              />
            </PermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách phòng ban">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
              <TableRow>
                {table.getFlatHeaders().map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 bg-card hover:bg-muted/25"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={pagination.currentPage}
        pageSize={pagination.limit}
        total={pagination.totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="pt-4"
      />
    </div>
  )
}
