import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"

import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { RowActions } from "@/components/shared/primitives/RowActions"
import { DeleteProductionJobIssueDialog } from "@/features/production-jobs/components/composites/DeleteProductionJobIssueDialog"
import { ProductionJobIssueQuantityCell } from "@/features/production-jobs/components/composites/ProductionJobIssueQuantityCell"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const col = createColumnHelper<typeof appTableFeatures, ProductionJobIssue>()

type BuildProductionJobBomColumnsOptions = {
  productionJobId: string
  // Job PENDING: quantity is edited inline and lines can be deleted; otherwise both stay read-only.
  isEditable: boolean
}

// Cột "Đã lãnh" và "Còn lại" đọc từ GET /production-jobs/:jobId/bom (kết nối tiến độ xuất kho).
export function buildProductionJobBomColumns({
  productionJobId,
  isEditable,
}: BuildProductionJobBomColumnsOptions) {
  return col.columns([
    col.display({
      id: "index",
      header: "STT",
      meta: {
        headerClassName: "w-14 text-center font-bold text-foreground",
        cellClassName: "py-3 text-center font-mono text-muted-foreground",
      },
      cell: ({ row }) => row.index + 1,
    }),
    col.display({
      id: "image",
      header: "Ảnh",
      meta: {
        headerClassName: "w-16 font-bold text-foreground",
        cellClassName: "py-3",
      },
      cell: ({ row }) => (
        <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
          {row.original.image ? (
            <Image
              src={resolveFileUrl(row.original.image.url)}
              alt={row.original.item.name}
              layout="fullWidth"
              objectFit="cover"
              className="size-full"
            />
          ) : (
            <Gallery className="size-4 text-muted-foreground/50" />
          )}
        </div>
      ),
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
        headerClassName: "w-32 text-right font-bold text-foreground",
        cellClassName: "py-3 text-right",
      },
      cell: ({ row }) => (
        <ProductionJobIssueQuantityCell
          productionJobId={productionJobId}
          issue={row.original}
          isEditable={isEditable}
        />
      ),
    }),
    col.accessor("onHand", {
      header: "Tồn kho",
      meta: {
        headerClassName: "w-28 text-right font-bold text-foreground",
        cellClassName: "py-3 text-right tabular-nums",
      },
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">
          {quantityFormatter.format(getValue())}
        </span>
      ),
    }),
    col.accessor("availableQuantity", {
      header: "Khả dụng",
      meta: {
        headerClassName: "w-28 text-right font-bold text-foreground",
        cellClassName: "py-3 text-right tabular-nums",
      },
      cell: ({ getValue }) => {
        const available = getValue()

        return (
          <span
            className={cn(
              "font-medium tabular-nums",
              available <= 0 ? "font-semibold text-destructive" : "text-success"
            )}
          >
            {quantityFormatter.format(available)}
          </span>
        )
      },
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
              className="gap-1.5 border-transparent bg-success/10 whitespace-nowrap text-success"
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
              className="gap-1.5 border-transparent bg-warning/10 whitespace-nowrap text-warning"
            >
              <span className="size-1.5 rounded-full bg-warning" />
              Lãnh một phần
            </Badge>
          )
        }

        return (
          <Badge
            variant="outline"
            className="gap-1.5 border-transparent bg-muted whitespace-nowrap text-muted-foreground"
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
      cell: ({ row }) =>
        isEditable ? (
          <RowActions>
            <DeleteProductionJobIssueDialog
              productionJobId={productionJobId}
              issue={row.original}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Xoá vật tư"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
            />
          </RowActions>
        ) : (
          <RowActions>
            <DisabledAction label="Xoá vật tư" hint="Job đã xác nhận kế hoạch">
              <Trash2 className="size-3.5" />
            </DisabledAction>
          </RowActions>
        ),
    }),
  ])
}
