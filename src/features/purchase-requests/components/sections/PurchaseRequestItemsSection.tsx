import { Link } from "@tanstack/react-router"
import { Info, PackageOpen, PackageSearch, TriangleAlert } from "lucide-react"
import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

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

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
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
            ))}
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

      {/* Hướng dẫn đọc số liệu + chú ý điều kiện chỉnh sửa — 2 thẻ song song, mỗi thẻ 1 tiêu đề +
          danh sách gạch đầu dòng có bold từ khóa, thay vì đoạn văn dài. Viền nhấn trái (border-l-4)
          cùng công thức với alertItems trong manage-dashboard.mock.ts (thẻ cảnh báo dashboard),
          tái dùng để 2 thẻ này rõ ràng là 1 khối riêng chứ không hòa vào bảng phía trên. */}
      <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:px-5 lg:grid-cols-2">
        <div className="rounded-lg border border-l-4 border-primary/30 border-l-primary bg-primary/5 p-3.5">
          <div className="flex items-center gap-2 text-primary">
            <Info className="size-4 shrink-0" />
            <p className="text-xs font-bold tracking-wide uppercase">
              Cách đọc các cột số liệu
            </p>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-primary/90">
            <li className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">
                  Tồn thực tế, Nhu cầu BOM, Tồn khả dụng, Đã báo tồn
                </span>{" "}
                — đọc trực tiếp tại thời điểm xem, có thể khác lúc tạo phiếu.
              </span>
            </li>
            <li className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">
                  SL đề xuất
                </span>{" "}
                là phần thiếu đã chốt sẵn lúc tạo phiếu — không cộng/trừ trực
                tiếp với các số ở trên.
              </span>
            </li>
            <li className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              <span>
                Xem chi tiết tại menu{" "}
                <Link
                  to="/manage/inventory-materials"
                  search={{ page: 1, limit: 10 }}
                  className="font-medium underline underline-offset-2"
                >
                  Tồn kho
                </Link>
                .
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-l-4 border-warning/30 border-l-warning bg-warning/10 p-3.5">
          <div className="flex items-center gap-2 text-warning">
            <TriangleAlert className="size-4 shrink-0" />
            <p className="text-xs font-bold tracking-wide uppercase">
              Lưu ý khi chỉnh sửa
            </p>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-warning/90">
            <li className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
              <span>
                Chỉ sửa/xóa được khi đề xuất còn ở trạng thái{" "}
                <span className="font-semibold text-foreground">
                  Nháp hoặc Từ chối
                </span>
              </span>
            </li>
            <li className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
              <span>
                SL đề xuất phải{" "}
                <span className="font-semibold text-foreground">lớn hơn 0</span>
              </span>
            </li>
            <li className="flex gap-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
              <span>
                Đề xuất phải còn{" "}
                <span className="font-semibold text-foreground">
                  ít nhất 1 dòng vật tư
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
