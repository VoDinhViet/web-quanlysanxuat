import { Diskette } from "@solar-icons/react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/inputs/NumericCellInput"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { useAppForm } from "@/hooks/use-app-form"
import { useUpdateProductionJobOperation } from "@/features/production-jobs/hooks/use-update-production-job-operation"
import type { ProductionJobOperation } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionJobOperationCompletedQuantityCellProps = {
  productionJobId: string
  operation: ProductionJobOperation
  canEdit: boolean
}

// Static, non-interactive rendering — Job not IN_PROGRESS/not yet approved, or the viewer lacks
// production:update (PermissionGate's fallback below).
function CompletedQuantityStatic({
  completedQuantity,
  rejectedQuantity,
}: {
  completedQuantity: number
  rejectedQuantity: number
}) {
  return (
    <div className="flex items-center justify-center gap-3 text-center tabular-nums">
      <span className="text-foreground">
        Đạt: {quantityFormatter.format(completedQuantity)}
      </span>
      {rejectedQuantity > 0 && (
        <span className="text-destructive">
          NG: {quantityFormatter.format(rejectedQuantity)}
        </span>
      )}
    </div>
  )
}

// Explicit "Lưu" button instead of auto-save-on-blur: typing alone doesn't fire the PATCH — only
// clicking the button (or pressing Enter) does. The button only appears once the form is dirty,
// so the row stays quiet until there's actually something to save. `useAppForm` + a local Zod
// schema (this is a UI-only validation, not a wire contract, so it lives inline rather than in
// `schemas/` — `plannedQuantity` is per-operation, not a fixed constant) replace the old raw
// `useState` + hand-rolled `if` checks + `toast.error`: an invalid value now shows as a
// `FieldError` line under the input, matching every other form in the app
// (ProductionOrderItemsCard.tsx's `NumericCellInput` + `FieldError` pair). `toast` still fires,
// unrelated to this — `useUpdateProductionJobOperation`'s own `onError` reports a real
// mutation/network failure, not a client-side validation one. `key` on the `<form>` remounts the
// whole `useAppForm` instance (defaultValues included) to the server value whenever it changes —
// on our own successful save (value now matches, a no-op remount, button disappears) or on
// failure (server value unchanged, the just-typed value stays put for the user to fix).
// Both quantities save through the same PATCH (backend requires both fields together) — one form,
// one button, so "Đạt" and "NG" can never be half-saved relative to each other.
function CompletedQuantityInput({
  productionJobId,
  operation,
}: Omit<ProductionJobOperationCompletedQuantityCellProps, "canEdit">) {
  const { mutate, isPending } = useUpdateProductionJobOperation(productionJobId)

  const form = useAppForm({
    defaultValues: {
      completedQuantity: operation.completedQuantity,
      rejectedQuantity: operation.rejectedQuantity,
    },
    validators: {
      onSubmit: z
        .object({
          completedQuantity: z
            .number("SL hoàn thành phải là số")
            .min(0, "SL hoàn thành không được nhỏ hơn 0."),
          rejectedQuantity: z
            .number("SL không đạt phải là số")
            .min(0, "SL không đạt không được nhỏ hơn 0."),
        })
        .refine(
          (value) =>
            value.completedQuantity + value.rejectedQuantity <=
            operation.plannedQuantity,
          {
            error:
              "Tổng SL hoàn thành + SL không đạt không được vượt SL kế hoạch.",
            path: ["completedQuantity"],
          }
        ),
    },
    onSubmit: ({ value }) => {
      if (
        value.completedQuantity === operation.completedQuantity &&
        value.rejectedQuantity === operation.rejectedQuantity
      ) {
        return
      }
      mutate({
        operationId: operation.id,
        completedQuantity: value.completedQuantity,
        rejectedQuantity: value.rejectedQuantity,
      })
    },
  })

  return (
    <form
      key={`${operation.id}-${operation.completedQuantity}-${operation.rejectedQuantity}`}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        void form.handleSubmit()
      }}
      noValidate
      className="mx-auto flex w-48 flex-col items-center gap-1"
    >
      <div className="flex items-center gap-2">
        <form.Field name="completedQuantity">
          {(field) => (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground">Đạt</span>
              <NumericCellInput
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? 0)}
                disabled={isPending}
                min={0}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="rejectedQuantity">
          {(field) => (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground">NG</span>
              <NumericCellInput
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? 0)}
                disabled={isPending}
                min={0}
              />
            </div>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) =>
            isDirty && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={isPending}
                    aria-label="Lưu SL hoàn thành/SL không đạt"
                    className="mt-3.5 shrink-0 animate-in duration-150 fade-in-0 zoom-in-90"
                  >
                    <Diskette className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lưu SL hoàn thành/SL không đạt</TooltipContent>
              </Tooltip>
            )
          }
        </form.Subscribe>
      </div>
      <form.Field name="completedQuantity">
        {(field) => (
          <FieldError
            errors={field.state.meta.errors}
            className="text-center text-[10px]"
          />
        )}
      </form.Field>
    </form>
  )
}

export function ProductionJobOperationCompletedQuantityCell({
  productionJobId,
  operation,
  canEdit,
}: ProductionJobOperationCompletedQuantityCellProps) {
  if (!canEdit) {
    return (
      <CompletedQuantityStatic
        completedQuantity={operation.completedQuantity}
        rejectedQuantity={operation.rejectedQuantity}
      />
    )
  }

  return (
    <PermissionGate
      permission="production:update"
      fallback={
        <CompletedQuantityStatic
          completedQuantity={operation.completedQuantity}
          rejectedQuantity={operation.rejectedQuantity}
        />
      }
    >
      <CompletedQuantityInput
        productionJobId={productionJobId}
        operation={operation}
      />
    </PermissionGate>
  )
}
