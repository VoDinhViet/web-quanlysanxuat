import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { productionJobOptionsQueryOptions } from "@/features/production-jobs/api/options"

// Server-searched options for a Job filter dropdown: debounces the typed term and reads
// productionJobOptionsQueryOptions (GET /api/production-jobs?status=IN_PROGRESS&...) from the
// shared query cache. `select` maps each job to the {value, label} pair the filter expects — not
// `buildSelectOptions` (src/lib/utils.ts), since that maps a {id, name} ref and a Job's display
// text is its `code`, not a `name`.
export function useGetProductionJobOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...productionJobOptionsQueryOptions(q),
    select: (jobs) => jobs.map((job) => ({ value: job.id, label: job.code })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
