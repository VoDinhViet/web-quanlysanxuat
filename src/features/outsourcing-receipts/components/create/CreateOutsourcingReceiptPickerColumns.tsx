import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { DateTime } from "luxon"

import { Checkbox } from "@/components/ui/checkbox"
import type { PendingOrderItem } from "@/lib/types/outsourcing-receipt.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const pendingOrderItemColumnHelper = createColumnHelper<PendingOrderItem>()

type BuildCreateOutsourcingReceiptPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  lockedSupplierId: string | undefined
  onToggleRow: (row: PendingOrderItem) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns cho bước ① — cùng idiom CreateOutsourcingOrderPickerColumns.tsx (bảng
// checkbox nhiều dòng, không phải radio 1 dòng như InventoryReceiptCreateFromPoPickerColumns.tsx,
// vì một phiếu OS-IN ở màn hình này có thể gộp nhiều dòng OS-OUT khác nhau, miễn cùng NCC). NCC
// không chọn tay trước — `lockedSupplierId` là NCC của dòng đầu tiên đã chọn (undefined nếu chưa
// chọn dòng nào); dòng khác NCC bị khoá không cho tích, tránh vi phạm ràng buộc BE (E187).
export function buildCreateOutsourcingReceiptPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  lockedSupplierId,
  onToggleRow,
  onToggleAll,
}: BuildCreateOutsourcingReceiptPickerColumnsArgs) {
  return [
    pendingOrderItemColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={allChecked}
          disabled={disabled}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Chọn tất cả"
        />
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => {
        const isOtherSupplier =
          lockedSupplierId !== undefined &&
          row.original.supplier.id !== lockedSupplierId

        return (
          <Checkbox
            checked={pickedIds.has(row.original.id)}
            disabled={disabled || isOtherSupplier}
            onCheckedChange={() => onToggleRow(row.original)}
            aria-label={`Chọn ${row.original.item.name}`}
          />
        )
      },
    }),
    pendingOrderItemColumnHelper.accessor((row) => row.outsourcingOrder.code, {
      id: "outsourcingOrderCode",
      header: "OS-OUT",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue, row }) => (
        <Link
          to="/manage/outsourcing-orders/$outsourcingOrderId"
          params={{ outsourcingOrderId: row.original.outsourcingOrder.id }}
          className="font-mono text-xs text-primary hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    pendingOrderItemColumnHelper.accessor((row) => row.supplier.name, {
      id: "supplierName",
      header: "NCC",
      meta: { headerClassName: "min-w-32" },
    }),
    pendingOrderItemColumnHelper.accessor(
      (row) => row.outsourcingOrder.sendDate,
      {
        id: "sendDate",
        header: "Ngày gửi",
        meta: {
          headerClassName: "min-w-24 text-center",
          cellClassName: "text-center text-xs text-muted-foreground",
        },
        cell: ({ getValue }) =>
          DateTime.fromISO(getValue(), { zone: "utc" }).toFormat("dd/MM/yyyy"),
      }
    ),
    pendingOrderItemColumnHelper.accessor("jobCode", {
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    pendingOrderItemColumnHelper.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "min-w-48" },
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
    pendingOrderItemColumnHelper.accessor("operationName", {
      header: "Công đoạn",
      meta: { headerClassName: "min-w-32" },
    }),
    pendingOrderItemColumnHelper.accessor((row) => row.unit.name, {
      id: "unitName",
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
    }),
    pendingOrderItemColumnHelper.accessor("quantity", {
      header: "SL đã gửi",
      meta: { headerClassName: "w-24 text-right", cellClassName: "text-right" },
      cell: ({ getValue }) => (
        <span className="font-semibold text-foreground tabular-nums">
          {quantityFormatter.format(getValue())}
        </span>
      ),
    }),
  ]
}
