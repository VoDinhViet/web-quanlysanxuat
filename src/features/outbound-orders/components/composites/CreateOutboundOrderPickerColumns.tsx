import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const unfulfilledOrderItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  UnfulfilledOrderItem
>()

type BuildCreateOutboundOrderPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  lockedClientId: string | undefined
  onToggleRow: (row: UnfulfilledOrderItem) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns cho bước ① — cùng idiom
// CreateOutsourcingReceiptPickerColumns.tsx (bảng checkbox nhiều dòng, một phiếu DO ở màn hình
// này có thể gộp nhiều dòng PO khác nhau, miễn cùng khách hàng). Khách hàng không chọn tay trước —
// `lockedClientId` là khách hàng của dòng đầu tiên đã chọn (undefined nếu chưa chọn dòng nào);
// dòng khác khách hàng bị khoá không cho tích, tránh vi phạm ràng buộc BE (E192). Không có
// filter/search — GET .../unfulfilled-order-items chưa lọc được gì (xem
// CreateOutboundOrderPickerSection.tsx's comment).
export function buildCreateOutboundOrderPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  lockedClientId,
  onToggleRow,
  onToggleAll,
}: BuildCreateOutboundOrderPickerColumnsArgs) {
  return unfulfilledOrderItemColumnHelper.columns([
    unfulfilledOrderItemColumnHelper.display({
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
        const isOtherClient =
          lockedClientId !== undefined &&
          row.original.client.id !== lockedClientId

        return (
          <Checkbox
            checked={pickedIds.has(row.original.orderItemId)}
            disabled={disabled || isOtherClient}
            onCheckedChange={() => onToggleRow(row.original)}
            aria-label={`Chọn ${row.original.item.name}`}
          />
        )
      },
    }),
    unfulfilledOrderItemColumnHelper.accessor((row) => row.client.name, {
      id: "clientName",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-32" },
    }),
    unfulfilledOrderItemColumnHelper.accessor((row) => row.order.code, {
      id: "orderCode",
      header: "PO",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue, row }) => (
        <Link
          to="/manage/orders/$orderId"
          params={{ orderId: row.original.order.id }}
          className="font-mono text-xs text-primary hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    unfulfilledOrderItemColumnHelper.display({
      id: "job",
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
      cell: ({ row }) => {
        const job = row.original.job
        if (!job) return "—"
        return (
          <Link
            to="/manage/production-jobs/$productionJobId"
            params={{ productionJobId: job.id }}
            search={{ tab: "info" }}
            className="font-mono text-xs text-primary hover:underline"
          >
            {job.code}
          </Link>
        )
      },
    }),
    unfulfilledOrderItemColumnHelper.display({
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
    unfulfilledOrderItemColumnHelper.accessor((row) => row.unit.name, {
      id: "unitName",
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
    }),
    unfulfilledOrderItemColumnHelper.accessor("orderedQuantity", {
      header: "SL đặt",
      meta: { headerClassName: "w-24 text-right", cellClassName: "text-right" },
      cell: ({ getValue }) => (
        <span className="font-semibold text-foreground tabular-nums">
          {quantityFormatter.format(getValue())}
        </span>
      ),
    }),
  ])
}
