import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { paymentTermLabels, PaymentTerm } from "@/lib/types/purchase-order.type"
import type { PaymentTerm as PaymentTermType } from "@/lib/types/purchase-order.type"

const UNSET = "unset"

type PurchaseOrderPaymentTermFieldProps = {
  purchaseOrderId: string
  paymentTerm: PaymentTermType | null
  editable: boolean
}

// Mirror PurchaseOrderExpectedDateField.tsx's shape — a plain <Select> (static 4-value enum, no
// search needed, unlike PurchaseOrderAssigneeField.tsx), commit on change.
export function PurchaseOrderPaymentTermField({
  purchaseOrderId,
  paymentTerm,
  editable,
}: PurchaseOrderPaymentTermFieldProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const [value, setValue] = useState(paymentTerm ?? UNSET)

  const { mutate: save } = useMutation({
    mutationFn: (nextPaymentTerm: PaymentTermType | null) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId, paymentTerm: nextPaymentTerm },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(paymentTerm ?? UNSET)
    },
  })

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Điều khoản TT
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {paymentTerm ? paymentTermLabels[paymentTerm] : "Chưa chọn"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor="purchase-order-payment-term"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Điều khoản TT
      </label>
      <Select
        value={value}
        onValueChange={(nextValue: string) => {
          setValue(nextValue)
          save(nextValue === UNSET ? null : (nextValue as PaymentTermType))
        }}
      >
        <SelectTrigger
          id="purchase-order-payment-term"
          className="h-9 w-full bg-background text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>Chưa chọn</SelectItem>
          {Object.values(PaymentTerm).map((term) => (
            <SelectItem key={term} value={term}>
              {paymentTermLabels[term]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
