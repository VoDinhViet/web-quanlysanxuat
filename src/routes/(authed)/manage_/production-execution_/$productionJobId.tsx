import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import {
  productionJobOperationsQueryOptions,
  productionJobQueryOptions,
} from "@/features/production-jobs/api"
import { ProductionExecutionJobPage } from "@/features/production-execution/pages/ProductionExecutionJobPage"
import { productionExecutionJobSearchSchema } from "@/features/production-execution/schemas/production-execution-job-search.schema"

export const Route = createFileRoute(
  "/(authed)/manage_/production-execution_/$productionJobId"
)({
  validateSearch: productionExecutionJobSearchSchema,
  // Unlike the list routes' deliberate "no loaderDeps" (avoids re-triggering on every filter
  // keystroke), this route's entire dataset depends on `operationId` — it SHOULD re-run the
  // loader when it changes.
  loaderDeps: ({ search }) => ({ operationId: search.operationId }),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.query({
        ...productionJobQueryOptions(params.productionJobId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...productionJobOperationsQueryOptions(params.productionJobId),
        staleTime: "static",
      }),
    ]),
  component: ProductionExecutionJobPage,
  pendingComponent: LayoutPagePending,
})
