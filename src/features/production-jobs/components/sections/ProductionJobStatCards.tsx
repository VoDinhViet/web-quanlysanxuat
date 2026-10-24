import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Skeleton } from "@/components/ui/skeleton"
import { productionJobStatsQueryOptions } from "@/features/production-jobs/api/options"
import { productionJobStatTiles } from "@/features/production-jobs/constants/production-job-stat-tiles"
import { productionJobStatsSearchSchema } from "@/features/production-jobs/schemas/production-job-stats-search.schema"
import type { ProductionJobStatus } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const gridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"

// Floor progress changes without this user's own writes (other users report, OQC closes Jobs), so
// the counts poll on top of the `["production-jobs"]` invalidation that Job-changing mutations do.
const STATS_REFETCH_INTERVAL_MS = 60_000

// The route loader only prefetches this without awaiting it, so a slow count never blocks the list.
// Each tile is a status filter: it writes `status` into the same URL search the table filter uses.
export function ProductionJobStatCards() {
  const search = useSearch({ from: "/(authed)/manage_/production-jobs/" })
  const navigate = useNavigate({ from: "/manage/production-jobs/" })

  const statsQuery = useQuery({
    ...productionJobStatsQueryOptions(
      productionJobStatsSearchSchema.parse(search)
    ),
    placeholderData: keepPreviousData,
    refetchInterval: STATS_REFETCH_INTERVAL_MS,
  })

  const handleSelectStatus = (status: ProductionJobStatus | undefined) => {
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  if (statsQuery.isPending) {
    return (
      <div className={gridClassName}>
        {productionJobStatTiles.map((tile) => (
          <div
            key={tile.label}
            className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-card"
          >
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Stats are secondary to the list: a failed first fetch hides the row instead of erroring the
  // page; a failed poll keeps showing the last counts.
  if (statsQuery.data === undefined) {
    return null
  }

  return (
    <div className={gridClassName}>
      {productionJobStatTiles.map((tile) => {
        const isActive = tile.status === search.status

        return (
          <button
            key={tile.label}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelectStatus(tile.status)}
            className={cn(
              "flex items-center gap-3 rounded-lg bg-card p-4 text-left shadow-card transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive && "ring-2 ring-primary"
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                tile.iconClassName
              )}
            >
              <tile.icon className="size-5" aria-hidden />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">
                {tile.label}
              </p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {statsQuery.data[tile.statKey]}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
