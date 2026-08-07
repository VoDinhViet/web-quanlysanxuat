import { queryOptions } from "@tanstack/react-query"

import { getItems } from "@/features/products/api/server-functions/get-items.api"
import { ItemType } from "@/lib/types/item.type"

// Orders' order-line picker (via this feature's `api` barrel — see
// .claude/rules/architecture.md's cross-feature import rule) can't use the
// options endpoint in item-options.options.ts: `OrderItemDialog` reads `unit`/`image` off the
// selected product to fill the line read-only, and ProductOptionResDto only
// carries `{id, code, name}`. So this stays on the list endpoint instead,
// capped at 100 rows and degrading to an empty list on failure. Returns the
// full `Item`, not narrowed — the hook maps it down to {value,label} itself.
// Fixed to `FG` (thành phẩm) — only a sellable end product can be an order
// line; WIP is only ever a BOM node (see item-options.options.ts).
export const orderItemOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["items", "order-options", q],
    queryFn: () =>
      getItems({ data: { q, type: ItemType.FG, limit: 100 } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: 5 * 60_000,
  })
