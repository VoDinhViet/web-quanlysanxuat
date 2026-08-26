import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { clientOptionsQueryOptions } from "@/features/clients/api"
import {
  productionJobsByOperationQueryOptions,
  productionOperationSummaryQueryOptions,
} from "@/features/production-execution/api/options"
import { ProductionExecutionPage } from "@/features/production-execution/pages/ProductionExecutionPage"
import { productionExecutionSearchSchema } from "@/features/production-execution/schemas/production-execution-search.schema"

// No loaderDeps, same reasoning as manage_/production-jobs/index.tsx: a filter/pagination
// navigation must not create a new route match, which would re-trigger this loader and blank
// the outlet. Both queries are read client-side in ProductionExecutionPage via useQuery instead.
export const Route = createFileRoute("/(authed)/manage_/production-execution/")(
  {
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
    // The parent route.tsx already renders the real PageTitleBar and never
    // pends, so this only needs to blank the content area — not
    // LayoutPagePending's full-page header placeholder, which would stack
    // under the real one.
    pendingComponent: PagePending,
  }
)
