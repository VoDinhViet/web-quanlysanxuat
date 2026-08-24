import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { productionJobOptionsQueryOptions } from "@/features/production-jobs/api/options"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobStatus as ProductionJobStatusType } from "@/lib/types/production-job.type"

// Server-searched options for a Job filter dropdown: debounces the typed term and reads
// productionJobOptionsQueryOptions (GET /api/production-jobs?status=...&...) from the shared query
// cache. `select` maps each job to the {value, label} pair the filter expects — not
// `buildSelectOptions` (src/lib/utils.ts), since that maps a {id, name} ref and a Job's display
// text is its `code`, not a `name`. Defaults `status` to IN_PROGRESS (outsourcing/requisition
// pickers keep that filter); pass `null` to fetch every status (inventory-receipts pickers).
export function useGetProductionJobOptions(
  status: ProductionJobStatusType | null = ProductionJobStatus.IN_PROGRESS
) {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...productionJobOptionsQueryOptions(q, status ?? undefined),
    select: (jobs) => jobs.map((job) => ({ value: job.id, label: job.code })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
