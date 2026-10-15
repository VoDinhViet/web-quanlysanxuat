import { NotesMinimalistic } from "@solar-icons/react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { Textarea } from "@/components/ui/textarea"
import { updatePaymentRequestNote } from "@/features/payment-requests/api/server-functions/update-payment-request-note.api"

type PaymentRequestNoteFieldProps = {
  paymentRequestId: string
  note: string | null
  purchaseOrderNote: string | null
  editable: boolean
}

// Cùng khuôn PaymentRequestInvoiceField: giữ state cục bộ tới khi blur, resync trong render khi
// server trả giá trị khác. Chưa có ghi chú riêng của YCTT thì hiện ghi chú của PO (PH-132).
export function PaymentRequestNoteField({
  paymentRequestId,
  note,
  purchaseOrderNote,
  editable,
}: PaymentRequestNoteFieldProps) {
  const queryClient = useQueryClient()
  const updateNoteFn = useServerFn(updatePaymentRequestNote)
  const shownNote = note ?? purchaseOrderNote ?? ""
  const [localValue, setLocalValue] = useState(shownNote)
  const [syncedValue, setSyncedValue] = useState(shownNote)
  if (shownNote !== syncedValue) {
    setSyncedValue(shownNote)
    setLocalValue(shownNote)
  }

  const { mutate: save } = useMutation({
    mutationFn: (nextNote: string) =>
      updateNoteFn({
        data: { paymentRequestId, note: nextNote.trim() || null },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
    onError: (error) => {
      toast.error(error.message)
      setLocalValue(shownNote)
    },
  })

  const label = (
    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
      <NotesMinimalistic className="size-4 text-muted-foreground" />
      Ghi chú
    </span>
  )

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1.5">
        {label}
        <p className="text-xs whitespace-pre-line text-foreground">
          {shownNote || "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor="payment-request-note" className="block">
        {label}
      </label>
      <Textarea
        id="payment-request-note"
        className="min-h-16 bg-card text-xs md:text-xs"
        placeholder="Nhập ghi chú cho yêu cầu thanh toán..."
        maxLength={1000}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={() => {
          if (localValue.trim() === shownNote) return
          save(localValue)
        }}
      />
      {note === null && purchaseOrderNote ? (
        <p className="text-[11px] text-muted-foreground">
          Đang hiển thị ghi chú của đơn mua hàng; sửa ở đây không đổi đơn mua.
        </p>
      ) : null}
    </div>
  )
}
