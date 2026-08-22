import { queryOptions } from "@tanstack/react-query"

import { getOqcAqlPlan } from "@/features/oqc/api/server-functions/get-aql-plan.api"
import type { IqcInspectionLevel } from "@/lib/types/iqc.type"

export const oqcAqlPlanQueryOptions = (
  quantity: number,
  inspectionLevel: IqcInspectionLevel,
  aqlLevel: number
) =>
  queryOptions({
    queryKey: ["oqc", "aql-plan", quantity, inspectionLevel, aqlLevel],
    queryFn: () =>
      getOqcAqlPlan({ data: { quantity, inspectionLevel, aqlLevel } }),
    staleTime: 5 * 60_000,
  })
