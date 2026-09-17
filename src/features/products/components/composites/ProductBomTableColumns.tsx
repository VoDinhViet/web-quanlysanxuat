import { createColumnHelper } from "@tanstack/react-table"

import type { appTableFeatures } from "@/lib/table-features"
import {
  BomCodeCell,
  BomLevelBadge,
  BomOperationsCell,
} from "@/features/products/components/primitives/BomTableCells"
import {
  CreatePartAction,
  DeletePartAction,
  ViewDetailAction,
} from "@/features/products/components/primitives/BomRowActions"
import type { BomTableActions } from "@/features/products/components/primitives/BomRowActions"
import type { BomRow } from "@/features/products/utils/bom-rows.util"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const bomColumnHelper = createColumnHelper<typeof appTableFeatures, BomRow>()

// Factory, không phải hằng module-scope như các bảng khác — cột THAO TÁC cần
// `productId`/`actions`, memoize ở call site (ProductBomTable.tsx) thay vì
// thread qua TableMeta chỉ để chuyền 2 giá trị.
export function createBomColumns(productId: string, actions: BomTableActions) {
  return bomColumnHelper.columns([
    bomColumnHelper.accessor("path", {
      header: "STT",
      meta: { headerClassName: "w-14" },
      cell: ({ row }) => (
        <span
          className={
            row.original.isRoot
              ? "font-mono font-bold text-foreground"
              : "font-mono font-bold text-muted-foreground"
          }
        >
          {row.original.path}
        </span>
      ),
    }),
    bomColumnHelper.display({
      id: "code",
      header: "MÃ BẢN VẼ",
      meta: { headerClassName: "w-48" },
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
            <CreatePartAction
              options={bomRow.createOptions}
              actions={actions}
            />
            {bomRow.component && (
              <DeletePartAction bomItem={bomRow.component} actions={actions} />
            )}
          </div>
        )
      },
    }),
  ])
}
