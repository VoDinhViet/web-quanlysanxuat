import { BillList } from "@solar-icons/react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { updatePaymentRequestInvoice } from "@/features/payment-requests/api/server-functions/update-payment-request-invoice.api"

type PaymentRequestInvoiceFieldProps = {
  paymentRequestId: string
  supplierInvoiceNo: string | null
  editable: boolean
}

// Cùng khuôn PurchaseOrderNoteField: giữ state cục bộ tới khi blur, resync trong render khi
// server trả giá trị khác (lỗi hoặc refetch).
export function PaymentRequestInvoiceField({
  paymentRequestId,
  supplierInvoiceNo,
  editable,
}: PaymentRequestInvoiceFieldProps) {
  const queryClient = useQueryClient()
  const updateInvoiceFn = useServerFn(updatePaymentRequestInvoice)
  const [localValue, setLocalValue] = useState(supplierInvoiceNo ?? "")
  const [syncedValue, setSyncedValue] = useState(supplierInvoiceNo ?? "")
  if ((supplierInvoiceNo ?? "") !== syncedValue) {
    setSyncedValue(supplierInvoiceNo ?? "")
    setLocalValue(supplierInvoiceNo ?? "")
  }

  const { mutate: save } = useMutation({
    mutationFn: (nextInvoiceNo: string) =>
      updateInvoiceFn({
        data: {
          paymentRequestId,
          supplierInvoiceNo: nextInvoiceNo.trim() || null,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
    onError: (error) => {
      toast.error(error.message)
      setLocalValue(supplierInvoiceNo ?? "")
    },
  })

  const label = (
    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
      <BillList className="size-4 text-muted-foreground" />
      Số hóa đơn NCC
    </span>
  )

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1.5">
        {label}
        <p className="font-mono text-xs text-foreground">
          {supplierInvoiceNo ?? "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor="payment-request-invoice-no" className="block">
        {label}
      </label>
      <Input
        id="payment-request-invoice-no"
        className="h-8 bg-card font-mono text-xs placeholder:font-sans placeholder:text-muted-foreground/75"
        placeholder="Nhập số hóa đơn của NCC..."
        maxLength={100}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={() => {
          if (localValue.trim() === (supplierInvoiceNo ?? "")) return
          save(localValue)
        }}
      />
    </div>
  )
}
