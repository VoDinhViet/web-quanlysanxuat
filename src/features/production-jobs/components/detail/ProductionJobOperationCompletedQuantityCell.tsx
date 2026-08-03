import { useState } from "react"

import { Input } from "@/components/ui/input"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { useUpdateProductionJobOperation } from "@/features/production-jobs/hooks/use-update-production-job-operation"
import type { ProductionJobOperation } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionJobOperationCompletedQuantityCellProps = {
  productionJobId: string
  operation: ProductionJobOperation
  planned: number
  canEdit: boolean
}

// Static, non-interactive rendering — Job not IN_PROGRESS, or the viewer lacks
// production:update (PermissionGate's fallback below).
function CompletedQuantityStatic({ quantity }: { quantity: number }) {
  return (
    <span className="block text-center text-foreground tabular-nums">
      {quantityFormatter.format(quantity)}
    </span>
  )
}

// Inline auto-save cell for `completedQuantity` — no separate "Lưu" button: typing then
// blurring (or pressing Enter, which just blurs) fires the PATCH straight away. Keyed on
// `${operation.id}-${operation.completedQuantity}` so the input remounts to the server value
// whenever it changes — on our own successful save (value now matches what was typed, a no-op
// remount) or on failure (server value unchanged, so the just-typed — now flagged invalid by the
// error toast — value stays put for the user to fix).
function CompletedQuantityInput({
  productionJobId,
  operation,
  planned,
}: Omit<ProductionJobOperationCompletedQuantityCellProps, "canEdit">) {
  const [value, setValue] = useState(String(operation.completedQuantity))
  const { mutate, isPending } = useUpdateProductionJobOperation(productionJobId)

  function handleBlur() {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed === operation.completedQuantity) {
      return
    }
    mutate({ operationId: operation.id, completedQuantity: parsed })
  }

  return (
    <Input
      key={`${operation.id}-${operation.completedQuantity}`}
      type="number"
      min={0}
      max={planned}
      step="any"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={handleBlur}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
      disabled={isPending}
      aria-label={`SL hoàn thành — ${operation.name}`}
      className="mx-auto h-8 w-20 text-center tabular-nums"
    />
  )
}

export function ProductionJobOperationCompletedQuantityCell({
  productionJobId,
  operation,
  planned,
  canEdit,
}: ProductionJobOperationCompletedQuantityCellProps) {
  if (!canEdit) {
    return <CompletedQuantityStatic quantity={operation.completedQuantity} />
  }

  return (
    <PermissionGate
      permission="production:update"
      fallback={
        <CompletedQuantityStatic quantity={operation.completedQuantity} />
      }
    >
      <CompletedQuantityInput
        productionJobId={productionJobId}
        operation={operation}
        planned={planned}
      />
    </PermissionGate>
  )
}
