import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { ClipboardMinus } from "lucide-react"

import { DataTable } from "@/components/shared/composites/DataTable"
import { TablePagination } from "@/components/shared/composites/TablePagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { inventoryRequisitionsColumns } from "@/features/inventory-requisitions/components/composites/InventoryRequisitionsTableColumns"
import { cn } from "@/lib/utils"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"
import type { Pagination } from "@/lib/types/pagination.type"

type InventoryRequisitionsTableProps = {
  rows: InventoryRequisition[]
  pagination: Pagination
  isPending: boolean
}

// Bảng danh sách phiếu lãnh vật tư — tự dựng useReactTable/flexRender, cùng idiom
// InventoryIssuesTable.
export function InventoryRequisitionsTable({
  rows,
  pagination,
  isPending,
}: InventoryRequisitionsTableProps) {
  const table = useReactTable({
    data: rows,
    columns: inventoryRequisitionsColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      className={cn(
        "min-w-0 flex-1 px-4 pb-4 transition-opacity lg:px-5",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      <DataTable
        table={table}
        isEmpty={rows.length === 0}
        emptyState={
          <TableEmpty
            icon={ClipboardMinus}
            title="Chưa có phiếu lãnh vật tư nào"
            description="Phiếu lãnh vật tư sẽ hiển thị tại đây sau khi được lập."
          />
        }
      />

      <TablePagination pagination={pagination} className="pt-4" />
    </div>
  )
}
