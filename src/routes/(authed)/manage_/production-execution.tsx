import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { clientOptionsQueryOptions } from "@/features/clients/api"
import {
  productionJobsByOperationQueryOptions,
  productionOperationSummaryQueryOptions,
} from "@/features/production-execution/api/options"
import { ProductionExecutionPage } from "@/features/production-execution/pages/ProductionExecutionPage"
import { productionExecutionSearchSchema } from "@/features/production-execution/schemas/production-execution-search.schema"

// No loaderDeps, same reasoning as manage_/production-jobs.tsx: a filter/pagination navigation
// must not create a new route match, which would re-trigger this loader and blank the whole
// page. Both queries are read client-side in ProductionExecutionPage via useQuery instead.
export const Route = createFileRoute("/(authed)/manage_/production-execution")({
  validateSearch: productionExecutionSearchSchema,
  loader: ({ context, location }) => {
    const search = productionExecutionSearchSchema.parse(location.search)

    return Promise.all([
      context.queryClient.ensureQueryData(
        productionOperationSummaryQueryOptions({
          q: search.q,
          status: search.status,
          clientId: search.clientId,
          dueDateFrom: search.dueDateFrom,
          dueDateTo: search.dueDateTo,
        })
      ),
      // Chỉ khi URL đã mang sẵn operationId (link chia sẻ/bookmark) — lần vào đầu không có, trang
      // tự chọn thẻ đầu tiên phía client sau khi operation-summary về (ProductionExecutionPage.tsx).
      search.operationId
        ? context.queryClient.ensureQueryData(
            productionJobsByOperationQueryOptions(search)
          )
        : Promise.resolve(),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ])
  },
  component: ProductionExecutionPage,
  pendingComponent: PageLoading,
})
