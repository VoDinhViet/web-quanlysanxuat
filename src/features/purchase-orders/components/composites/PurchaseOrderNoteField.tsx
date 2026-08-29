import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { Textarea } from "@/components/ui/textarea"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"

type PurchaseOrderNoteFieldProps = {
  purchaseOrderId: string
  note: string | null
  editable: boolean
}

// Mirror TableTextCellInput.tsx's local-state-until-blur + render-phase resync (see that file's
// comment for why the resync shadow state matters: without it, a value corrected server-side —
// or another header field's invalidate-triggered refetch — wouldn't propagate back into this
// input). Commit on blur, not per keystroke, same reasoning as every other text input in this
// codebase.
export function PurchaseOrderNoteField({
  purchaseOrderId,
  note,
  editable,
}: PurchaseOrderNoteFieldProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const [localValue, setLocalValue] = useState(note ?? "")
  const [syncedValue, setSyncedValue] = useState(note ?? "")
  if ((note ?? "") !== syncedValue) {
    setSyncedValue(note ?? "")
    setLocalValue(note ?? "")
  }

  const { mutate: save } = useMutation({
    mutationFn: (nextNote: string) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId, note: nextNote || null },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setLocalValue(note ?? "")
    },
  })

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Ghi chú
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {note ?? "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor="purchase-order-note"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Ghi chú
      </label>
      <Textarea
        id="purchase-order-note"
        className="min-h-16 resize-none bg-background text-xs"
        placeholder="Nhập ghi chú"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={() => {
          if (localValue === (note ?? "")) return
          save(localValue)
        }}
      />
    </div>
  )
}
