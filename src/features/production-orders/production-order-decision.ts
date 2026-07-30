import type { UpdateProductionOrderSchema } from "@/features/production-orders/schemas/update-production-order.schema"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

// Diffs form values against the last-saved snapshot rather than relying on TanStack Form's own
// `state.isDirty` — after a successful save the form's mount-time `defaultValues` go stale, and
// `form.reset()` doesn't repaint already-mounted inputs in this version (see the same note on
// `src/hooks/use-form-draft.ts`). Re-deriving "what changed" from `production.items` avoids both
// problems: once `["production-orders"]` is invalidated and `production` refetches to the saved
// values, the diff collapses to empty on its own, no `reset()` call needed. This also doubles as
// the PATCH payload — the backend only touches lines actually sent, so only the changed subset
// should go on the wire. A blanked-out input reads as `NaN`, which never equals the saved number,
// so it always counts as changed — the save button stays enabled and the real error surfaces via
// the schema on submit.
export function findChangedProductionQuantities(
  values: UpdateProductionOrderSchema,
  production: ProductionOrderDetail
): UpdateProductionOrderSchema["items"] {
  const savedQuantities = new Map(
    production.items.map((item) => [item.orderItemId, item.quantity])
  )

  return values.items.filter(
    (item) => Number(item.quantity) !== savedQuantities.get(item.orderItemId)
  )
}
