import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { useState } from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/shared/DatePicker"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"

type PurchaseOrderExpectedDateFieldProps = {
  purchaseOrderId: string
  expectedDate: string | null
  editable: boolean
}

// Only field editable on the PO header — mirror PurchaseRequestItemQuantityCell.tsx's shape
// (own mutation, purchaseOrderId read via prop since the header already has it, no need for
// useParams here). Commits onChange (a date picker has no per-keystroke focus-loss risk the way
// a text/number input does, so there's no reason to wait for a blur).
export function PurchaseOrderExpectedDateField({
  purchaseOrderId,
  expectedDate,
  editable,
}: PurchaseOrderExpectedDateFieldProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const [value, setValue] = useState(expectedDate ?? "")

  const { mutate: save } = useMutation({
    mutationFn: (nextExpectedDate: string) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId, expectedDate: nextExpectedDate },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(expectedDate ?? "")
    },
  })

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Ngày giao dự kiến
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {expectedDate
            ? DateTime.fromISO(expectedDate).toFormat("dd/MM/yyyy")
            : "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor="purchase-order-expected-date"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Ngày giao dự kiến <span className="text-destructive">*</span>
      </label>
      <DatePicker
        id="purchase-order-expected-date"
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue)
          if (nextValue.length > 0) save(nextValue)
        }}
      />
    </div>
  )
}
