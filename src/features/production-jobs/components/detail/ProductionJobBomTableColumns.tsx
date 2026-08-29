import { createColumnHelper } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const col = createColumnHelper<ProductionJobIssue>()

// "Sửa"/"Xoá" là DisabledAction — production_job_issues chỉ có đúng một đường ghi (transaction
// duyệt LSX), chưa có route thêm/sửa/xoá độc lập nào (xem docs/domains/production.md,
// Invariants; và "Thêm vật tư" cùng lý do trong ProductionJobBomTab.tsx).
export const productionJobBomColumns = [
  col.display({
    id: "index",
    header: "STT",
    meta: {
      headerClassName: "w-14 font-bold text-foreground",
      cellClassName: "py-3 font-mono text-muted-foreground",
    },
    cell: ({ row }) => row.index + 1,
  }),
  col.accessor((row) => row.item.code, {
    id: "code",
    header: "Mã vật tư",
    meta: {
      headerClassName: "w-32 font-bold text-foreground",
      cellClassName: "py-3 font-mono font-semibold text-foreground",
    },
  }),
  col.accessor((row) => row.item.name, {
    id: "name",
    header: "Tên vật tư",
    meta: {
      headerClassName: "min-w-44 font-bold text-foreground",
      cellClassName: "py-3 font-medium text-foreground",
    },
  }),
  col.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: {
      headerClassName: "w-24 font-bold text-foreground",
      cellClassName: "py-3 text-muted-foreground",
    },
  }),
  col.accessor("requiredQty", {
    header: "SL cần",
    meta: {
      headerClassName: "w-28 text-center font-bold text-foreground",
      cellClassName: "py-3 text-center text-foreground tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "w-24 text-center font-bold text-foreground",
      cellClassName: "py-3",
    },
    cell: () => (
      <div className="flex items-center justify-center gap-1.5">
        <DisabledAction label="Sửa vật tư" hint="chưa được xây dựng">
          <Pencil className="size-3.5" />
        </DisabledAction>
        <DisabledAction label="Xoá vật tư" hint="chưa được xây dựng">
          <Trash2 className="size-3.5" />
        </DisabledAction>
      </div>
    ),
  }),
]
