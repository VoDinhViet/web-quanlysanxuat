import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import type { PageSize } from "@/components/shared/composites/Pagination"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type PurchaseOrderRemainingLine = {
  id: string
  code: string
  name: string
  unitName: string
  orderedQuantity: number
  receivedQuantity: number
  remaining: number
}

const col = createColumnHelper<
  typeof appTableFeatures,
  PurchaseOrderRemainingLine
>()

const columns = col.columns([
  col.accessor("code", {
    header: "Mã vật tư",
    meta: {
      headerClassName: "min-w-28",
      cellClassName: "font-mono font-semibold text-foreground",
    },
  }),
  col.accessor("name", {
    header: "Tên vật tư",
    meta: {
      headerClassName: "min-w-44",
      cellClassName: "font-medium text-foreground",
    },
  }),
  col.accessor("unitName", {
    header: "ĐVT",
    meta: { headerClassName: "w-20", cellClassName: "text-muted-foreground" },
  }),
  col.accessor("orderedQuantity", {
    header: "SL đặt",
    meta: {
      headerClassName: "w-24 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  col.accessor("receivedQuantity", {
    header: "SL đã nhận",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right text-muted-foreground tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  col.accessor("remaining", {
    header: "Còn lại",
    meta: {
      headerClassName: "w-24 text-right",
      cellClassName: "text-right font-semibold text-foreground tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
])

type CreateInventoryReceiptFromPoItemsDialogProps = {
  purchaseOrderId: string | null
  onClose: () => void
}

// Dialog "xem nhanh" khi click một hàng ở bước ① — bảng đầy đủ các dòng CÒN phải nhập của PO đó,
// để quyết định chọn PO nào mà không phải sang bước ②. Đọc lại đúng `purchaseOrderQueryOptions`
// mà bước ② dùng nên mở xem nhanh cũng làm nóng cache cho bước ② (React Query dedupe theo query
// key). Cùng luật "còn phải nhập" mà CreateInventoryReceiptFromPoForm.tsx dùng lúc seed bước ③
// (`Math.max(quantity - receivedQuantity, 0)` rồi lọc `> 0`) — sửa luật thì sửa cả hai chỗ.
// Body tách riêng + `key` theo id để state phân trang tự reset khi đổi PO. Không có
// DialogTrigger bên trong nên `open` chỉ có thể do parent đóng — prop là `onClose`, không phải
// `onOpenChange(boolean)` mà mọi call site phải tự lọc nhánh `true` chết.
export function CreateInventoryReceiptFromPoItemsDialog({
  purchaseOrderId,
  onClose,
}: CreateInventoryReceiptFromPoItemsDialogProps) {
  return (
    <Dialog
      open={purchaseOrderId !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        {purchaseOrderId !== null && (
          <PurchaseOrderItemsBody
            key={purchaseOrderId}
            purchaseOrderId={purchaseOrderId}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type PurchaseOrderItemsBodyProps = {
  purchaseOrderId: string
  onClose: () => void
}

function PurchaseOrderItemsBody({
  purchaseOrderId,
  onClose,
}: PurchaseOrderItemsBodyProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

  const { data: purchaseOrder, isPending } = useQuery(
    purchaseOrderQueryOptions(purchaseOrderId)
  )

  const remainingLines: PurchaseOrderRemainingLine[] = useMemo(
    () =>
      (purchaseOrder?.items ?? [])
        .map((line) => ({
          id: line.id,
          code: line.purchaseRequestItem.item.code,
          name: line.purchaseRequestItem.item.name,
          unitName: line.purchaseRequestItem.item.unit.name,
          orderedQuantity: line.quantity,
          receivedQuantity: line.receivedQuantity,
          remaining: Math.max(line.quantity - line.receivedQuantity, 0),
        }))
        .filter((line) => line.remaining > 0),
    [purchaseOrder?.items]
  )

  // PO detail trả về mọi dòng trong 1 request nên phân trang cắt ngay trên client — Pagination
  // thuần presentational, bind thẳng setPage (không qua useRoutePagination vì state cục bộ).
  // useMemo để `data` giữ nguyên identity giữa các lần render, không bắt useTable dựng lại row
  // model — cùng cách filteredItems/filteredLines ở các section anh em.
  const pagedLines = useMemo(
    () => remainingLines.slice((page - 1) * pageSize, page * pageSize),
    [remainingLines, page, pageSize]
  )

  const table = useTable({
    data: pagedLines,
    columns,
    features: appTableFeatures,
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>Vật tư cần nhập</DialogTitle>
        <DialogDescription>
          {purchaseOrder
            ? `${purchaseOrder.code} — ${purchaseOrder.supplier.name}`
            : "Đang tải đơn mua hàng..."}
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-x-auto rounded-md border border-border/50">
        <Table aria-label="Danh sách vật tư cần nhập của đơn mua hàng">
          <TableHeader className="[&>tr]:h-11 [&>tr]:hover:bg-muted/45">
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TableEmpty
                    colSpan={columns.length}
                    title={
                      isPending ? "Đang tải..." : "Không còn vật tư cần nhập"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id} className="h-12">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={remainingLines.length}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize)
          setPage(1)
        }}
      />

      <DialogFooter>
        <Button type="button" onClick={onClose}>
          Đóng
        </Button>
      </DialogFooter>
    </>
  )
}
