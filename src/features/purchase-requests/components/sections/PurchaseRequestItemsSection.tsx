import { Link } from "@tanstack/react-router"
import { Info, PackageOpen, PackageSearch, TriangleAlert } from "lucide-react"
import { useMemo } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildPurchaseRequestItemColumns } from "@/features/purchase-requests/components/composites/PurchaseRequestItemsTableColumns"
import type { PurchaseRequestItem } from "@/lib/types/purchase-request.type"

type PurchaseRequestItemsSectionProps = {
  rows: PurchaseRequestItem[]
  editable: boolean
}

// Section header + table, same "tiêu đề dải" idiom as InfoSection in ProductionJobInfoTab.tsx —
// a single-section screen doesn't earn a Tabs strip (rule "no abstraction until the 3rd use").
export function PurchaseRequestItemsSection({
  rows,
  editable,
}: PurchaseRequestItemsSectionProps) {
  const columns = useMemo(
    () => buildPurchaseRequestItemColumns(editable),
    [editable]
  )

  const table = useTable({
    data: rows,
    columns,
    features: appTableFeatures,
  })

  return (
    <div className="not-first:border-t not-first:border-border">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Chi tiết vật tư
      </h3>

      {rows.length === 0 ? (
        <TableEmpty
          icon={PackageOpen}
          title="Chưa có vật tư nào"
          description="Đề xuất này chưa có dòng vật tư nào."
        />
      ) : (
        <Table aria-label="Chi tiết vật tư">
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
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Chú thích ngắn dưới bảng — 2 dòng thường thay cho 2 thẻ màu: cách đọc số liệu, và điều
          kiện chỉnh sửa (chỉ hiện khi người xem thật sự sửa được). */}
      <div className="mx-4 mb-4 flex flex-col gap-1.5 rounded-md bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground sm:mx-5">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <span className="font-medium text-foreground">
              Tồn thực tế, Nhu cầu BOM, Tồn khả dụng, Đã báo tồn
            </span>{" "}
            đọc trực tiếp lúc xem;{" "}
            <span className="font-medium text-foreground">SL đề xuất</span> là
            phần thiếu đã chốt lúc tạo phiếu. Xem thêm tại{" "}
            <Link
              to="/manage/inventory-directs"
              search={{ page: 1, limit: 10 }}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Tồn kho
            </Link>
            .
          </span>
        </p>
        {editable && (
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
            <span>
              Sửa/xóa được khi phiếu ở trạng thái{" "}
              <span className="font-medium text-foreground">
                Nháp hoặc Từ chối
              </span>
              ; SL đề xuất phải lớn hơn 0 và phiếu còn ít nhất 1 dòng vật tư.
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
