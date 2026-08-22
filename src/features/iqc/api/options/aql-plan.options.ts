import { queryOptions } from "@tanstack/react-query"

import { getIqcAqlPlan } from "@/features/iqc/api/server-functions/get-aql-plan.api"
import type { IqcInspectionLevel } from "@/lib/types/iqc.type"

export const iqcAqlPlanQueryOptions = (
  quantity: number,
  inspectionLevel: IqcInspectionLevel,
  aqlLevel: number
) =>
  queryOptions({
    queryKey: ["iqc", "aql-plan", quantity, inspectionLevel, aqlLevel],
    queryFn: () =>
      getIqcAqlPlan({ data: { quantity, inspectionLevel, aqlLevel } }),
    staleTime: 5 * 60_000,
  })
