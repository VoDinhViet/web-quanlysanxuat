import { useMemo } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { InfoCircle } from "@solar-icons/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { appTableFeatures } from "@/lib/table-features"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import { cn } from "@/lib/utils"
import { createBomColumns } from "@/features/products/components/composites/ProductBomTableColumns"
import type { BomTableActions } from "@/features/products/components/primitives/BomRowActions"
import { buildBomRows } from "@/features/products/utils/bom-rows.util"
import type { BomItem } from "@/lib/types/bom-item.type"
import type { Item } from "@/lib/types/item.type"

const partLabel = bomItemTypeLabels.COMPONENT

// Short usage hint above the tree — the table has no other on-screen
// explanation of the create/xem-chi-tiết affordances, so a first-time user
// has nothing to go on beyond the icon tooltips.
function BomTableGuidance() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <InfoCircle className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        Cây kết cấu (BOM) thể hiện các {partLabel} lắp ráp nên sản phẩm — một{" "}
        {partLabel} có thể chứa {partLabel} con khác. Nhấn{" "}
        <span className="font-medium text-foreground">"Thêm {partLabel}"</span>{" "}
        rồi chọn thêm bên trong hay ngang hàng, và biểu tượng mắt để mở trang
        chi tiết vật tư và công đoạn của một dòng.
      </p>
    </div>
  )
}

type ProductBomTableProps = {
  product: Item
  nodes: BomItem[]
  actions: BomTableActions
}

// Bảng cây BOM — tự dựng useTable/flexRender như mọi bảng khác trong repo
// (xem ProductsTable.tsx), thay vì dựng TableRow/TableCell tay như trước.
export function ProductBomTable({
  product,
  nodes,
  actions,
}: ProductBomTableProps) {
  const rows = useMemo(() => buildBomRows(product, nodes), [product, nodes])
  const columns = useMemo(
    () => createBomColumns(product.id, actions),
    [product.id, actions]
  )
  const table = useTable({ data: rows, columns, features: appTableFeatures })

  return (
    <div className="space-y-3">
      <BomTableGuidance />

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Cây kết cấu sản phẩm">
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
                id={row.original.id}
                className={cn("h-14", row.original.isRoot && "bg-muted/10")}
              >
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
      </div>
    </div>
  )
}
