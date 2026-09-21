import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { BomItemDetailScreen } from "@/features/products/components/sections/BomItemDetailScreen"
import {
  itemBomQueryOptions,
  itemQueryOptions,
} from "@/features/products/api/options"

// Thin params/data gate, same split as ProductDetailPage — the real screen lives in
// BomItemDetailScreen, keyed by bomItem.id so navigating to a different node (e.g. the sidebar's
// "Hạng mục cha" link, same route with a new param) remounts the form instead of reusing stale
// defaultValues.
export function BomItemDetailPage() {
  const { productId, bomItemId } = useParams({
    from: "/(authed)/manage_/products_/$productId_/bom/$bomItemId",
  })

  const { data: product } = useSuspenseQuery(itemQueryOptions(productId))
  const { data: nodes } = useSuspenseQuery(itemBomQueryOptions(productId))

  const bomItem = nodes.find((node) => node.id === bomItemId) ?? null

  // The route loader already redirects away when the node isn't in the tree — this only covers
  // the brief window after this page's own delete mutation invalidates the cache and before
  // onSuccessDelete's navigate() actually lands.
  if (!bomItem) {
    return null
  }

  return (
    <BomItemDetailScreen
      key={bomItem.id}
      product={product}
      bomItem={bomItem}
      nodes={nodes}
    />
  )
}
