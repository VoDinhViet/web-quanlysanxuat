import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { itemQueryOptions } from "@/features/products/api"
import { supplierReturnQueryOptions } from "@/features/supplier-returns/api/options"
import { SupplierReturnDetailPage } from "@/features/supplier-returns/pages/SupplierReturnDetailPage"
import { supplierQueryOptions } from "@/features/suppliers/api"

// Unlike other detail routes' single `ensureQueryData`, the two enrichment queries here
// (NCC/vật tư) can only be keyed once the phiếu trả itself is known — the list-derived
// `supplier`/`item` refs on the detail response only carry {id, code, name}, not the full
// entity the mockup needs (address/representatives, image). So the primary query is awaited
// first, then the two dependents run together.
export const Route = createFileRoute(
  "/(authed)/manage_/supplier-returns_/$supplierReturnId"
)({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(
      supplierReturnQueryOptions(params.supplierReturnId)
    )

    await Promise.all([
      context.queryClient.ensureQueryData(
        supplierQueryOptions(detail.supplier.id)
      ),
      context.queryClient.ensureQueryData(itemQueryOptions(detail.item.id)),
    ])
  },
  component: SupplierReturnDetailPage,
  pendingComponent: LayoutPagePending,
})
