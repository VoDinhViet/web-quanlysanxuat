import { createColumnHelper } from "@tanstack/react-table"
import { Routing } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { appTableFeatures } from "@/lib/table-features"
import {
  BomCodeCell,
  BomLevelBadge,
  BomOperationsCell,
} from "@/features/products/components/primitives/BomTableCells"
import {
  CreateActionsMenu,
  DeleteDirectAction,
  DeletePartAction,
  EditDirectAction,
  ViewDetailAction,
} from "@/features/products/components/primitives/BomTreeActions"
import type { BomTableActions } from "@/features/products/components/primitives/BomTreeActions"
import type { BomTree } from "@/features/products/utils/bom-tree"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const bomColumnHelper = createColumnHelper<typeof appTableFeatures, BomTree>()

// Trạng thái đóng/mở bảng công đoạn của dòng Cấp 0 — sở hữu ở ProductBomTable
// (state cục bộ, không phải URL/form state), chỉ truyền xuống đây để vẽ nút.
// Đặt tên "routing" theo đúng thuật ngữ backend (routing_operations/
// createRoutingOperation, xem use-product-operations.ts) — Cấp 0 không phải
// một node `bom_items` nên công đoạn của nó không đi qua bảng `bom_operations`.
export type RoutingOperationsToggle = {
  isOpen: boolean
  onToggle: () => void
}

// Factory, không phải hằng module-scope như các bảng khác — cột THAO TÁC cần
// `productId`/`actions`/`routingOperationsToggle`, memoize ở call site
// (ProductBomTable.tsx) thay vì thread qua TableMeta chỉ để chuyền vài giá trị.
export function createBomColumns(
  productId: string,
  actions: BomTableActions,
  routingOperationsToggle: RoutingOperationsToggle
) {
  return bomColumnHelper.columns([
    bomColumnHelper.accessor("path", {
      header: "STT",
      meta: { headerClassName: "w-16" },
      cell: ({ row }) => (
        <span
          className={
            row.original.isRoot
              ? "font-mono font-bold text-foreground text-sm"
              : row.original.bomItem?.isOffStructure
                ? "font-mono font-semibold text-amber-700 dark:text-amber-400 text-xs"
                : "font-mono font-semibold text-muted-foreground text-xs"
          }
        >
          {row.original.path}
        </span>
      ),
    }),
    bomColumnHelper.display({
      id: "code",
      header: "MÃ BẢN VẼ",
      meta: { headerClassName: "min-w-60" },
      cell: ({ row }) => <BomCodeCell row={row.original} />,
    }),
    bomColumnHelper.accessor("name", {
      header: "TÊN BẢN VẼ",
      meta: { headerClassName: "min-w-44", cellClassName: "max-w-48" },
      cell: ({ row }) => (
        <span
          className={
            row.original.isRoot
              ? "block truncate font-bold text-foreground"
              : "block truncate font-semibold text-foreground"
          }
          title={row.original.name}
        >
          {row.original.name}
        </span>
      ),
    }),
    bomColumnHelper.accessor("level", {
      header: "CẤP",
      meta: { headerClassName: "w-20" },
      cell: ({ getValue }) => <BomLevelBadge level={getValue()} />,
    }),
    bomColumnHelper.accessor("quantity", {
      header: "SỐ LƯỢNG",
      meta: {
        headerClassName: "w-24 text-center",
        cellClassName: "text-center font-semibold text-foreground tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    bomColumnHelper.accessor("unit", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-20",
        cellClassName: "font-medium text-muted-foreground",
      },
      cell: ({ getValue }) => {
        const unit = getValue()
        return unit ? <span title={unit.code}>{unit.name}</span> : "—"
      },
    }),
    bomColumnHelper.display({
      id: "operations",
      header: "CÔNG ĐOẠN",
      meta: { headerClassName: "min-w-48", cellClassName: "max-w-64" },
      cell: ({ row }) => <BomOperationsCell row={row.original} />,
    }),
    bomColumnHelper.display({
      id: "actions",
      header: "THAO TÁC",
      meta: { headerClassName: "min-w-52 text-right" },
      cell: ({ row }) => {
        const bomRow = row.original
        return (
          <div className="flex justify-end gap-1">
            <ViewDetailAction productId={productId} row={bomRow} />
            {/* Chỉ dòng Cấp 0 có bảng công đoạn mở/đóng ngay tại chỗ — COMPONENT sửa công đoạn ở
                trang chi tiết riêng (xem ViewDetailAction). Inline luôn (không tách
                BomTreeActions.tsx) vì chỉ dùng đúng 1 chỗ. */}
            {bomRow.isRoot && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Công đoạn"
                      aria-expanded={routingOperationsToggle.isOpen}
                      onClick={routingOperationsToggle.onToggle}
                    >
                      <Routing className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Công đoạn</TooltipContent>
              </Tooltip>
            )}
            {bomRow.bomItem?.isOffStructure ? (
              <>
                <EditDirectAction row={bomRow} />
                <DeleteDirectAction row={bomRow} actions={actions} />
              </>
            ) : (
              <>
                <CreateActionsMenu row={bomRow} actions={actions} />
                {/* Dòng Cấp 0 có `bomItem: null` (đi cùng sản phẩm, không xoá riêng) — chỉ node
                    thật mới render DeletePartAction. */}
                {bomRow.bomItem && (
                  <DeletePartAction
                    bomItem={bomRow.bomItem}
                    actions={actions}
                  />
                )}
              </>
            )}
          </div>
        )
      },
    }),
  ])
}
