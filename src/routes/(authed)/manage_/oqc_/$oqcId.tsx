import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
import { oqcQueryOptions } from "@/features/oqc/api/options"
import { OqcDetailPage } from "@/features/oqc/pages/OqcDetailPage"
import { itemQueryOptions } from "@/features/products/api"

// Query làm giàu thành phẩm (ảnh — cho OqcFinishedGoodStrip.tsx) chỉ key được sau khi biết chính
// phiếu OQC, nên chạy sau chứ không gộp Promise.all — cùng khuôn hai bước với
// iqc_/$iqcId.tsx/supplier-returns_/$supplierReturnId.tsx.
export const Route = createFileRoute("/(authed)/manage_/oqc_/$oqcId")({
  loader: async ({ context, params }) => {
    const oqc = await context.queryClient.ensureQueryData(
      oqcQueryOptions(params.oqcId)
    )

    await context.queryClient.ensureQueryData(itemQueryOptions(oqc.item.id))
  },
  component: OqcDetailPage,
  pendingComponent: LayoutPagePending,
})
