import { createColumnHelper } from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import type { appTableFeatures } from "@/lib/table-features"

import { vnZone } from "@/lib/time"
import { productionJobLogActionLabels } from "@/lib/types/production-job.type"
import type { ProductionJobLog } from "@/lib/types/production-job.type"

const columnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionJobLog
>()

export const productionJobLogColumns = columnHelper.columns([
  columnHelper.accessor("createdAt", {
    header: "Thời gian",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap tabular-nums">
        {format(parseISO(getValue(), { in: vnZone }), "dd/MM/yyyy HH:mm")}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.performerBy?.fullName ?? "Hệ thống", {
    id: "performer",
    header: "Người thực hiện",
    meta: { headerClassName: "min-w-32" },
  }),
  columnHelper.accessor((row) => productionJobLogActionLabels[row.action], {
    id: "action",
    header: "Hành động",
    meta: { headerClassName: "min-w-28" },
  }),
  columnHelper.accessor("content", {
    header: "Nội dung",
    meta: { headerClassName: "min-w-48" },
  }),
])
