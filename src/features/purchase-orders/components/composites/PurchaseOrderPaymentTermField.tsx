import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { paymentTermLabels, PaymentTerm } from "@/lib/types/payment-term.type"
import type { PaymentTerm as PaymentTermType } from "@/lib/types/payment-term.type"

type PurchaseOrderPaymentTermFieldProps = {
  purchaseOrderId: string
  paymentTerm: PaymentTermType | null
  editable: boolean
}

// Mirror PurchaseOrderExpectedDateField.tsx's shape — a plain <Select> (static 4-value enum, no
// search needed, unlike PurchaseOrderAssigneeField.tsx), commit on change. Bắt buộc — không còn
// lựa chọn "Chưa chọn"; PO chưa từng đặt điều khoản (paymentTerm null, ví dụ sinh từ RFQ cũ) mặc
// định hiển thị/chọn "Thanh toán ngay" (IMMEDIATE) thay vì để trống.
export function PurchaseOrderPaymentTermField({
  purchaseOrderId,
  paymentTerm,
  editable,
}: PurchaseOrderPaymentTermFieldProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const [value, setValue] = useState(paymentTerm ?? PaymentTerm.IMMEDIATE)

  const { mutate: save } = useMutation({
    mutationFn: (nextPaymentTerm: PaymentTermType) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId, paymentTerm: nextPaymentTerm },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(paymentTerm ?? PaymentTerm.IMMEDIATE)
    },
  })

  // paymentTerm null only ever means "never committed" (e.g. a PO generated from an old RFQ) —
  // the select already shows IMMEDIATE as its default, so persist that default for real instead
  // of leaving the backend field null until the user happens to touch the dropdown themselves.
  useEffect(() => {
    if (editable && paymentTerm === null) {
      save(PaymentTerm.IMMEDIATE)
    }
  }, [editable, paymentTerm, save])

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Điều khoản TT
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {paymentTermLabels[paymentTerm ?? PaymentTerm.IMMEDIATE]}
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
        Điều khoản TT <span className="text-destructive">*</span>
      </label>
      <Select
        selectedKey={value}
        onSelectionChange={(key) => {
          const nextPaymentTerm = String(key) as PaymentTermType
          setValue(nextPaymentTerm)
          save(nextPaymentTerm)
        }}
      >
        <SelectTrigger
          id="purchase-order-payment-term"
          className="h-9 w-full bg-background text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PaymentTerm).map((term) => (
            <SelectItem key={term} id={term}>
              {paymentTermLabels[term]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
