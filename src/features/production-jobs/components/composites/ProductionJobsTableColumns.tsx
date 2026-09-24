import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/primitives/ProductionJobBadges"
import {
  ProductImageCell,
  ProductionJobActionsCell,
} from "@/features/production-jobs/components/primitives/ProductionJobTableCells"
import type { ProductionJob } from "@/lib/types/production-job.type"

const productionJobColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionJob
>()

// No "Mã SP"/"Tên sản phẩm" columns — ProductionJobResDto (list) dropped the nested `product`
// object 2026-07-31 in favor of a flat `image`, keeping only the columns the table needs (see
// production-job.type.ts). Those two columns aren't recoverable from this endpoint; the full
// product reference is only on GET /production-jobs/:jobId.
const baseProductionJobColumns = [
  productionJobColumnHelper.display({
    id: "image",
    header: "",
    meta: { headerClassName: "w-16" },
    cell: ({ row }) => <ProductImageCell image={row.original.image} />,
  }),
  productionJobColumnHelper.accessor((row) => row.client?.name ?? "—", {
    id: "client",
    header: "KH",
    meta: { headerClassName: "min-w-36" },
  }),
  productionJobColumnHelper.accessor("orderCode", {
    header: "PO",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  productionJobColumnHelper.accessor("code", {
    header: "JOB",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  productionJobColumnHelper.accessor("quantity", {
    header: "Qty (PO)",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center",
    },
  }),
  productionJobColumnHelper.accessor("orderDate", {
    header: "Ngày đặt hàng",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  productionJobColumnHelper.accessor("dueDate", {
    header: "Ngày giao hàng",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const dueDate = getValue()

      return dueDate === null
        ? "—"
        : DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")
    },
  }),
  productionJobColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <ProductionJobStatusBadge status={getValue()} />,
  }),
  productionJobColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <ProductionJobActionsCell productionJobId={row.original.id} />
    ),
  }),
]

export type BuildProductionJobColumnsOptions = {
  selectedJobIds: Set<string>
  onToggleJob: (job: ProductionJob) => void
  onToggleAll: (checked: boolean) => void
  allChecked: boolean
  isIndeterminate: boolean
  // Biểu mẫu kế hoạch chỉ xuất được cho một khách hàng — đã tích Job của KH nào thì Job của KH
  // khác (hoặc Job chưa có KH) bị khoá.
  selectedClientId: string | undefined
  hasSelectableRows: boolean
}

// Base UI's checkbox exposes `data-disabled`, not the native `disabled` attribute the shared
// primitive's `disabled:` variants key off, so the dimmed look is applied here.
const disabledCheckboxClassName =
  "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:opacity-40"

const otherClientHint = "Job thuộc khách hàng khác với các Job đã chọn"
const noClientHint = "Job chưa có khách hàng nên không xuất được biểu mẫu"

function getJobSelectionHint(
  job: ProductionJob,
  selectedClientId: string | undefined
) {
  if (job.client === null) return noClientHint
  if (selectedClientId !== undefined && job.client.id !== selectedClientId) {
    return otherClientHint
  }
  return undefined
}

export function buildProductionJobColumns(
  options: BuildProductionJobColumnsOptions
) {
  return productionJobColumnHelper.columns([
    productionJobColumnHelper.display({
      id: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={options.allChecked}
            indeterminate={options.isIndeterminate}
            disabled={!options.hasSelectableRows}
            className={disabledCheckboxClassName}
            onCheckedChange={options.onToggleAll}
            aria-label="Chọn tất cả Job trên trang này"
          />
        </div>
      ),
      meta: {
        headerClassName: "w-10 px-2 text-center",
        cellClassName: "w-10 px-2 text-center",
      },
      cell: ({ row }) => {
        const hint = getJobSelectionHint(row.original, options.selectedClientId)

        return (
          <div className="flex items-center justify-center" title={hint}>
            <Checkbox
              checked={options.selectedJobIds.has(row.original.id)}
              disabled={hint !== undefined}
              className={disabledCheckboxClassName}
              onCheckedChange={() => options.onToggleJob(row.original)}
              aria-label={`Chọn Job ${row.original.code}`}
            />
          </div>
        )
      },
    }),
    ...baseProductionJobColumns,
  ])
}
