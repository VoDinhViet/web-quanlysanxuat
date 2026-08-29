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
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        productionJobQueryOptions(params.productionJobId)
      ),
      context.queryClient.ensureQueryData(
        productionJobOperationsQueryOptions(params.productionJobId)
      ),
    ]),
  component: ProductionExecutionJobPage,
  pendingComponent: LayoutPagePending,
})
