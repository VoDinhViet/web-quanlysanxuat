import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const col = createColumnHelper<typeof appTableFeatures, ProductionJobIssue>()

// "Sửa"/"Xoá" là DisabledAction — production_job_issues chỉ có đúng một đường ghi (transaction
// duyệt LSX), chưa có route thêm/sửa/xoá độc lập nào (xem docs/domains/production.md,
// Invariants; và "Thêm vật tư" cùng lý do trong ProductionJobBomTab.tsx).
// Cột "Đã lãnh" và "Còn lại" đọc từ GET /production-jobs/:jobId/bom (kết nối tiến độ xuất kho).
export const productionJobBomColumns = col.columns([
  col.display({
    id: "index",
    header: "STT",
    meta: {
      headerClassName: "w-14 text-center font-bold text-foreground",
      cellClassName: "py-3 text-center font-mono text-muted-foreground",
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
      headerClassName: "w-20 font-bold text-foreground",
      cellClassName: "py-3 text-muted-foreground",
    },
  }),
  col.accessor("requiredQty", {
    header: "SL cần",
    meta: {
      headerClassName: "w-28 text-right font-bold text-foreground",
      cellClassName: "py-3 text-right font-medium text-foreground tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  col.accessor("issuedQuantity", {
    header: "Đã lãnh",
    meta: {
      headerClassName: "w-28 text-right font-bold text-foreground",
      cellClassName: "py-3 text-right tabular-nums",
    },
    cell: ({ row, getValue }) => {
      const issued = getValue() ?? 0
      const required = row.original.requiredQty
      const isFullyIssued = issued >= required && required > 0

      return (
        <span
          className={cn(
            "font-medium tabular-nums",
            isFullyIssued
              ? "font-semibold text-success"
              : issued > 0
                ? "font-semibold text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
          )}
        >
          {quantityFormatter.format(issued)}
        </span>
      )
    },
  }),
  col.accessor("remainingQuantity", {
    header: "Còn lại",
    meta: {
      headerClassName: "w-28 text-right font-bold text-foreground",
      cellClassName: "py-3 text-right tabular-nums",
    },
    cell: ({ getValue }) => {
      const remaining = getValue() ?? 0

      return (
        <span
          className={cn(
            "font-medium tabular-nums",
            remaining > 0
              ? "font-semibold text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          )}
        >
          {remaining > 0 ? quantityFormatter.format(remaining) : "—"}
        </span>
      )
    },
  }),
  col.display({
    id: "status",
    header: "Trạng thái",
    meta: {
      headerClassName: "w-36 text-center font-bold text-foreground",
      cellClassName: "py-3 text-center",
    },
    cell: ({ row }) => {
      const issued = row.original.issuedQuantity ?? 0
      const required = row.original.requiredQty

      if (issued >= required && required > 0) {
        return (
          <Badge
            variant="outline"
            className="gap-1.5 whitespace-nowrap border-transparent bg-success/10 text-success"
          >
            <span className="size-1.5 rounded-full bg-success" />
            Đã lãnh đủ
          </Badge>
        )
      }

      if (issued > 0) {
        return (
          <Badge
            variant="outline"
            className="gap-1.5 whitespace-nowrap border-transparent bg-warning/10 text-warning"
          >
            <span className="size-1.5 rounded-full bg-warning" />
            Lãnh một phần
          </Badge>
        )
      }

      return (
        <Badge
          variant="outline"
          className="gap-1.5 whitespace-nowrap border-transparent bg-muted text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          Chưa lãnh
        </Badge>
      )
    },
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
])
