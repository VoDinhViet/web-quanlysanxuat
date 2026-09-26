import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import {
  productionExecutionJobOperationsQueryOptions,
  productionExecutionJobQueryOptions,
} from "@/features/production-execution/api"
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
  // Thiếu `operationId` (link cũ/gõ tay): bỏ qua loader, trang tự quay về màn chọn công đoạn.
  loader: ({ context, params, deps }) =>
    deps.operationId
      ? Promise.all([
          context.queryClient.query({
            ...productionExecutionJobQueryOptions(
              params.productionJobId,
              deps.operationId
            ),
            staleTime: "static",
          }),
          context.queryClient.query({
            ...productionExecutionJobOperationsQueryOptions(
              params.productionJobId,
              deps.operationId
            ),
            staleTime: "static",
          }),
        ])
      : undefined,
  component: ProductionExecutionJobPage,
  pendingComponent: LayoutPagePending,
})
