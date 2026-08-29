import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { iqcQueryOptions } from "@/features/iqc/api/options"
import { IqcDetailPage } from "@/features/iqc/pages/IqcDetailPage"
import { itemQueryOptions } from "@/features/products/api"

// Unlike a single `ensureQueryData`, the item enrichment query here (vật tư — for
// IqcMaterialStrip's ảnh) can only be keyed once the IQC itself is known, so it runs after —
// same two-step shape as supplier-returns_/$supplierReturnId.tsx. departmentOptionsQueryOptions
// (for IqcGeneralInfoCard's Bộ phận QC select) doesn't depend on the IQC, so it runs alongside
// the primary query instead of waiting on it.
export const Route = createFileRoute("/(authed)/manage_/iqc_/$iqcId")({
  loader: async ({ context, params }) => {
    const [iqc] = await Promise.all([
      context.queryClient.ensureQueryData(iqcQueryOptions(params.iqcId)),
      context.queryClient.ensureQueryData(departmentOptionsQueryOptions()),
    ])

    await context.queryClient.ensureQueryData(itemQueryOptions(iqc.item.id))
  },
  component: IqcDetailPage,
  pendingComponent: LayoutPagePending,
})
