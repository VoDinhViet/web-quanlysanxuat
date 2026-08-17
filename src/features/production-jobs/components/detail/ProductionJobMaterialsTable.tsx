import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MissingFieldValue } from "@/components/shared/feedback/MissingFieldValue"
import { TableEmptyRow } from "@/components/shared/feedback/TableEmptyRow"
import { TablePagination } from "@/components/shared/data/TablePagination"
import type { ProductionJobMaterial } from "@/lib/types/production-job.type"
import type { Pagination } from "@/lib/types/pagination.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const columnCount = 7

type ProductionJobMaterialsTableProps = {
  rows: ProductionJobMaterial[]
  pagination: Pagination
  page: number
  limit: number
}

export function ProductionJobMaterialsTable({
  rows,
  pagination,
  page,
  limit,
}: ProductionJobMaterialsTableProps) {
  return (
    <div className="px-4 pb-4 lg:px-5">
      <Table>
        <TableHeader>
          <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
            <TableHead className="w-14 font-bold text-foreground">
              STT
            </TableHead>
            <TableHead className="w-32 font-bold text-foreground">
              Mã vật tư
            </TableHead>
            <TableHead className="min-w-44 font-bold text-foreground">
              Tên vật tư
            </TableHead>
            <TableHead className="w-24 font-bold text-foreground">
              ĐVT
            </TableHead>
            <TableHead className="w-24 text-center font-bold text-foreground">
              Định mức
            </TableHead>
            <TableHead className="w-24 text-center font-bold text-foreground">
              SL cần
            </TableHead>
            <TableHead className="min-w-48 font-bold text-foreground">
              Tiến độ xuất kho
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmptyRow colSpan={columnCount} />
          ) : (
            rows.map((material, index) => (
              <TableRow
                key={material.itemId ?? material.materialCode}
                className="bg-card hover:bg-muted/20"
              >
                <TableCell className="py-3 font-mono text-muted-foreground">
                  {(page - 1) * limit + index + 1}
                </TableCell>
                <TableCell className="py-3 font-mono font-semibold text-foreground">
                  {material.materialCode}
                </TableCell>
                <TableCell className="py-3 font-medium text-foreground">
                  {material.materialName}
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {material.unitName}
                </TableCell>
                <TableCell className="py-3 text-center text-foreground tabular-nums">
                  {material.unitQty !== null
                    ? quantityFormatter.format(material.unitQty)
                    : "—"}
                </TableCell>
                <TableCell className="py-3 text-center text-foreground tabular-nums">
                  {quantityFormatter.format(material.requiredQty)}
                </TableCell>
                <TableCell className="py-3">
                  <MissingFieldValue label="Chưa có API xuất kho" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}
