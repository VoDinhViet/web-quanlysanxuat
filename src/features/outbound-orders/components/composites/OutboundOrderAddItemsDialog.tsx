import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Plus } from "lucide-react"
import type { ReactElement } from "react"

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { unfulfilledOrderItemsQueryOptions } from "@/features/outbound-orders/api/options"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const col = createColumnHelper<typeof appTableFeatures, UnfulfilledOrderItem>()

type OutboundOrderAddItemsDialogProps = {
  clientId: string
  outboundOrderId: string
  trigger: ReactElement
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

  const columns = col.columns([
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
    col.accessor("orderedQuantity", {
      header: "SL đặt",
      meta: {
        headerClassName: "w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    col.accessor("issuedQuantity", {
      header: "Đã giao",
      meta: {
        headerClassName: "w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    col.display({
      id: "remainingQuantity",
      header: "Còn lại",
      meta: {
        headerClassName: "w-20 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => {
        const remaining = Math.max(
          0,
          row.original.orderedQuantity - row.original.issuedQuantity
        )
        if (remaining <= 0) {
          return (
            <span className="text-xs font-medium text-muted-foreground">
              Đã đủ
            </span>
          )
        }
        return (
          <span className="font-semibold text-foreground">
            {quantityFormatter.format(remaining)}
          </span>
        )
      },
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
        const remaining = Math.max(
          0,
          row.original.orderedQuantity - row.original.issuedQuantity
        )
        const isFullyDelivered = remaining <= 0
        const isPicked = alreadyPickedOrderItemIds.has(row.original.orderItemId)
        const label = isFullyDelivered
          ? "Đã giao đủ định mức PO"
          : isPicked
            ? "Đã có trong phiếu"
            : "Thêm dòng này"
        return (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPicked || isFullyDelivered}
                  aria-label={label}
                  onClick={() => onAdd(row.original)}
                >
                  <Plus className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      },
    }),
  ])

  const table = useTable({
    data: rows,
    columns,
    features: appTableFeatures,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm từ PO/Job</DialogTitle>
          <DialogDescription>
            Chỉ hiện dòng PO của cùng khách hàng với phiếu này.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-md border border-border/50">
          <Table aria-label="Danh sách dòng PO/Job">
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
                        query.isPending
                          ? "Đang tải..."
                          : "Không tìm thấy dòng nào"
                      }
                    />
                  </TableCell>
                </TableRow>
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
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.limit}
            total={pagination.totalRecords}
            onPageChange={setPage}
          />
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
