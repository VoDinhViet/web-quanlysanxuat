import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { RadioGroupItem } from "@/components/ui/radio-group"
import {
  productionJobStatusLabels,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"
import type { ProductionJob } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

function formatDueDate(dueDate: string | null): string {
  return dueDate === null
    ? "—"
    : DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")
}

function JobStatusBadge({ status }: { status: ProductionJobStatus }) {
  const isPending = status === ProductionJobStatus.PENDING
  const isInProgress = status === ProductionJobStatus.IN_PROGRESS
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-xs",
        isPending && "bg-muted text-muted-foreground",
        isInProgress &&
          "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isPending && "bg-muted-foreground/50",
          isInProgress && "bg-blue-500 dark:bg-blue-400"
        )}
      />
      {productionJobStatusLabels[status]}
    </Badge>
  )
}

const jobPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionJob
>()

type BuildCreateInventoryRequisitionJobPickerColumnsArgs = {
  disabled?: boolean
}

export function buildCreateInventoryRequisitionJobPickerColumns({
  disabled = false,
}: BuildCreateInventoryRequisitionJobPickerColumnsArgs = {}) {
  return jobPickerColumnHelper.columns([
    jobPickerColumnHelper.display({
      id: "select",
      meta: {
        headerClassName: "w-10 pl-3 pr-1 text-center",
        cellClassName: "w-10 pl-3 pr-1 text-center",
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <RadioGroupItem
            value={row.original.id}
            disabled={disabled}
            aria-label={`Chọn Job ${row.original.code}`}
          />
        </div>
      ),
    }),
    jobPickerColumnHelper.accessor("code", {
      header: "Mã Job",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {getValue()}
        </span>
      ),
    }),
    jobPickerColumnHelper.accessor("orderCode", {
      header: "Mã LSX",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {getValue()}
        </span>
      ),
    }),
    jobPickerColumnHelper.accessor((row) => row.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-36" },
      cell: ({ getValue }) => (
        <span className="text-xs text-foreground/80">{getValue()}</span>
      ),
    }),
    jobPickerColumnHelper.accessor("quantity", {
      header: "Số lượng",
      meta: {
        headerClassName: "w-24 text-center",
        cellClassName: "text-center tabular-nums text-xs text-foreground/80",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    jobPickerColumnHelper.accessor("status", {
      header: "Trạng thái",
      meta: {
        headerClassName: "w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => <JobStatusBadge status={getValue()} />,
    }),
    jobPickerColumnHelper.accessor("dueDate", {
      header: "Hạn giao",
      meta: {
        headerClassName: "w-28 text-center",
        cellClassName: "text-center tabular-nums text-xs text-muted-foreground",
      },
      cell: ({ getValue }) => formatDueDate(getValue()),
    }),
  ])
}
