import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { unfulfilledOrderItemsQueryOptions } from "@/features/outbound-orders/api/options"
import { cn } from "@/lib/utils"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const col = createColumnHelper<UnfulfilledOrderItem>()

type OutboundOrderAddItemsDialogProps = {
  clientId: string
  outboundOrderId: string
  trigger: ReactNode
  alreadyPickedOrderItemIds: Set<string>
  onAdd: (row: UnfulfilledOrderItem) => void
}

// Popup "Thêm từ PO/Job" (BUG-090) — mở lại từ trang Sửa, khác bước ① wizard Tạo
// (CreateOutboundOrderPickerSection.tsx) ở 2 điểm: đã biết sẵn `clientId` (lọc thẳng ở BE, không
// khoá client theo dòng đầu tiên chọn) và truyền `excludeOutboundOrderId` để "Đã giữ"/"Có thể
// giao" không tự trừ chính phiếu đang sửa (BE đã làm ở outbound-orders.query.ts). Click một dòng
// là thêm ngay (không cần chọn nhiều rồi bấm xác nhận) — dòng đã có trong phiếu disable lại, popup
// không tự đóng để thêm liên tiếp nhiều dòng.
export function OutboundOrderAddItemsDialog({
  clientId,
  outboundOrderId,
  trigger,
  alreadyPickedOrderItemIds,
  onAdd,
}: OutboundOrderAddItemsDialogProps) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 10

  const query = useQuery({
    ...unfulfilledOrderItemsQueryOptions({
      clientId,
      excludeOutboundOrderId: outboundOrderId,
      page,
      limit,
    }),
    placeholderData: keepPreviousData,
    enabled: open,
  })

  const rows = query.data?.data ?? []
  const pagination = query.data?.pagination

  const columns = [
    col.accessor((row) => row.order.code, {
      id: "orderCode",
      header: "PO",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-primary">{getValue()}</span>
      ),
    }),
    col.display({
      id: "job",
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
      cell: ({ row }) => row.original.job?.code ?? "—",
    }),
    col.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "min-w-40" },
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.item.name}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.item.code}
          </p>
        </div>
      ),
    }),
    col.accessor("availableQuantity", {
      header: "Có thể giao",
      meta: { headerClassName: "w-24 text-right", cellClassName: "text-right" },
      cell: ({ getValue }) => (
        <span className="font-semibold text-emerald-600 tabular-nums">
          {quantityFormatter.format(getValue())}
        </span>
      ),
    }),
    col.display({
      id: "action",
      header: "",
      meta: {
        headerClassName: "w-20 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => {
        const isPicked = alreadyPickedOrderItemIds.has(row.original.orderItemId)
        return (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={isPicked}
            title={isPicked ? "Đã có trong phiếu" : "Thêm dòng này"}
            onClick={() => onAdd(row.original)}
          >
            <Plus className="size-3.5" />
          </Button>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm từ PO/Job</DialogTitle>
          <DialogDescription>
            Chỉ hiện dòng PO của cùng khách hàng với phiếu này.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-md border border-border/50">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-11 hover:bg-muted/45"
                >
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
            <TableBody
              className={cn(
                query.isFetching && "pointer-events-none opacity-50"
              )}
            >
              {rows.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title={
                    query.isPending ? "Đang tải..." : "Không tìm thấy dòng nào"
                  }
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.original.orderItemId} className="h-12">
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

        {pagination && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trang {pagination.currentPage}/{pagination.totalPages} —{" "}
              {pagination.totalRecords} kết quả
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>
            Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
