import { createFileRoute, redirect } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { BomItemDetailPage } from "@/features/products/pages/BomItemDetailPage"
import {
  bomItemOperationsQueryOptions,
  itemBomQueryOptions,
  itemQueryOptions,
} from "@/features/products/api/options"
import { bomItemDetailSearchSchema } from "@/features/products/schemas/bom-item-detail-search.schema"
import { unitOptionsQueryOptions } from "@/features/units/api"

// The trailing underscore on `$productId_` opts this route out of nesting under
// `products_/$productId.tsx` (the detail page, which renders no <Outlet/>) while keeping the
// same URL segment — see "Layer boundaries" in architecture.md.
export const Route = createFileRoute(
  "/(authed)/manage_/products_/$productId_/bom/$bomItemId"
)({
  validateSearch: bomItemDetailSearchSchema,
  loader: async ({ context, params }) => {
    const [, nodes] = await Promise.all([
      context.queryClient.query({
        ...itemQueryOptions(params.productId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...itemBomQueryOptions(params.productId),
        staleTime: "static",
      }),
      // Picker "ĐVT" của node COMPONENT trong BomItemInfoTab.
      context.queryClient.query({
        ...unitOptionsQueryOptions(),
        staleTime: "static",
      }),
      // Công đoạn của riêng node này — không còn kèm trong GET .../bom nữa (BE gọn lại, mỗi lần
      // đọc cây không cần join thêm bảng công đoạn), fetch riêng cho tab "Công đoạn".
      context.queryClient.query({
        ...bomItemOperationsQueryOptions(params.productId, params.bomItemId),
        staleTime: "static",
      }),
    ])

    // There is no GET for a single BOM node — the page finds it in the product's tree. A node
    // that isn't there (deleted, or a mistyped id) bounces to the product's BOM tab instead of
    // rendering an empty page. The loader still doesn't `return` anything (see "Loaders
    // prefetch, don't return"); it only awaits to both prefetch the cache and check membership.
    if (!nodes.some((node) => node.id === params.bomItemId)) {
      throw redirect({
        to: "/manage/products/$productId",
        params: { productId: params.productId },
        search: { tab: "boms" },
      })
    }
  },
  component: BomItemDetailPage,
  pendingComponent: LayoutPagePending,
})
