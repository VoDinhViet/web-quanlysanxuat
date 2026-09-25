import { Fragment, useMemo, useState } from "react"
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
import { ProductOperationsPanel } from "@/features/products/components/composites/ProductOperationsPanel"
import type { BomTableActions } from "@/features/products/components/primitives/BomRowActions"
import { buildBomRows } from "@/features/products/utils/bom-rows.util"
import type { OperationsTarget } from "@/features/products/hooks/use-product-operations"
import type { BomItem } from "@/lib/types/bom-item.type"
import type { Item } from "@/lib/types/item.type"
import type { ProductOperation } from "@/lib/types/operation.type"

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
        rồi chọn thêm bên trong hay ngang hàng,{" "}
        <span className="font-medium text-foreground">"Thêm vật tư"</span> để
        khai vật tư ngoài cấu trúc ngay dưới dòng đó, và biểu tượng mắt để mở
        trang chi tiết vật tư và công đoạn của một Part.
      </p>
    </div>
  )
}

type ProductBomTableProps = {
  product: Item
  nodes: BomItem[]
  // Công đoạn Cấp 0 — không nằm trong `nodes` nữa (docs/decisions/
  // level-0-outside-bom-tree-response.md), đọc riêng qua
  // `itemOperationsQueryOptions` ở ProductBomTab.tsx.
  rootOperations: ProductOperation[]
  routingOperationsPending: boolean
  actions: BomTableActions
}

// Bảng cây BOM — tự dựng useTable/flexRender như mọi bảng khác trong repo
// (xem ProductsTable.tsx), thay vì dựng TableRow/TableCell tay như trước.
export function ProductBomTable({
  product,
  nodes,
  rootOperations,
  routingOperationsPending,
  actions,
}: ProductBomTableProps) {
  // Đóng/mở bảng công đoạn của dòng Cấp 0 — state cục bộ (không phải URL/form
  // state), toggle qua nút "Thêm công đoạn" ở cột THAO TÁC (ProductBomTableColumns.tsx).
  const [isRoutingOperationsOpen, setIsRoutingOperationsOpen] = useState(false)
  // Dựng thẳng từ `product.id` thay vì nhận qua prop — target routing operations chỉ cần
  // đúng giá trị này (không có `bomItemId`, xem OperationsTarget).
  const routingOperationsTarget = useMemo<OperationsTarget>(
    () => ({ productId: product.id }),
    [product.id]
  )

  const rows = useMemo(
    () => buildBomRows(product, nodes, rootOperations),
    [product, nodes, rootOperations]
  )
  const columns = useMemo(
    () =>
      createBomColumns(product.id, actions, {
        isOpen: isRoutingOperationsOpen,
        onToggle: () => setIsRoutingOperationsOpen((open) => !open),
      }),
    [product.id, actions, isRoutingOperationsOpen]
  )
  const table = useTable({ data: rows, columns, features: appTableFeatures })
  const columnCount = table.getFlatHeaders().length

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
              <Fragment key={row.id}>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Bảng công đoạn đầy đủ của dòng Cấp 0 — chỉ mount khi mở, ngay dưới dòng "0"
                    thay vì đứng cố định trên cả bảng cây. */}
                {row.original.isRoot && isRoutingOperationsOpen && (
                  <TableRow
                    key={`${row.id}-operations`}
                    className="bg-muted/5 hover:bg-muted/5"
                  >
                    <TableCell colSpan={columnCount} className="p-0">
                      <ProductOperationsPanel
                        target={routingOperationsTarget}
                        productOperations={row.original.operations}
                        isPending={routingOperationsPending}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
