import { queryOptions } from "@tanstack/react-query"

import { getQcPassRate } from "@/features/reports/api/server-functions/get-qc-pass-rate.api"

export const qcPassRateQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "qc-pass-rate"],
    queryFn: () => getQcPassRate(),
  })
