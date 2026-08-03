import { queryOptions } from "@tanstack/react-query"

import { getProducts } from "@/features/products/api/server-functions/get-products.api"
import { ProductType } from "@/lib/types/product.type"

// Orders' order-line picker (via this feature's `api` barrel — see
// .claude/rules/architecture.md's cross-feature import rule) can't use the
// options endpoint in product-options.options.ts: `OrderItemDialog` reads `unit`/`image` off the
// selected product to fill the line read-only, and ProductOptionResDto only
// carries `{id, code, name}`. So this stays on the list endpoint instead,
// capped at 100 rows and degrading to an empty list on failure. Returns the
// full `Product`, not narrowed — the hook maps it down to {value,label} itself.
// Fixed to `FINISHED_GOOD` (thành phẩm) — only a sellable end product can be
// an order line; WORK_IN_PROGRESS is only ever a BOM node (see
// product-options.options.ts).
export const orderProductOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "order-options", q],
    queryFn: () =>
      getProducts({ data: { q, type: ProductType.FINISHED_GOOD, limit: 100 } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: 5 * 60_000,
  })
