import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { ProductionJobDetailPage } from "@/features/production-jobs/pages/ProductionJobDetailPage"
import { productionJobDetailSearchSchema } from "@/features/production-jobs/schemas/production-job-detail-search.schema"

// UI-only for now (task 8.2): no loader, since the page reads a hardcoded mock payload rather
// than GET /production-jobs/:jobId — see production-job-detail.mock.ts. `params.productionJobId`
// isn't read yet either; it exists to shape the URL ahead of the real API.
export const Route = createFileRoute(
  "/(authed)/manage_/production-jobs_/$productionJobId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "production:read"),
  validateSearch: productionJobDetailSearchSchema,
  component: ProductionJobDetailPage,
})
