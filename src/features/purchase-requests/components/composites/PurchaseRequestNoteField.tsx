import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { Textarea } from "@/components/ui/textarea"
import { updatePurchaseRequestNote } from "@/features/purchase-requests/api/server-functions/update-purchase-request-note.api"
import { useHasPermission } from "@/hooks/use-permissions"

type PurchaseRequestNoteFieldProps = {
  purchaseRequestId: string
  note: string | null
}

// Mirror PurchaseOrderNoteField.tsx's local-state-until-blur + render-phase resync — commit on
// blur, not per keystroke. Khác PurchaseOrderNoteField: sửa được ở MỌI trạng thái (BE
// `PATCH .../note` không chặn theo status), nên chỉ cần quyền, không cần DRAFT/REJECTED như phần
// sửa dòng vật tư của trang này.
export function PurchaseRequestNoteField({
  purchaseRequestId,
  note,
}: PurchaseRequestNoteFieldProps) {
  const editable = useHasPermission("purchase-requests:update")
  const queryClient = useQueryClient()
  const updatePurchaseRequestNoteFn = useServerFn(updatePurchaseRequestNote)
  const [localValue, setLocalValue] = useState(note ?? "")
  const [syncedValue, setSyncedValue] = useState(note ?? "")
  if ((note ?? "") !== syncedValue) {
    setSyncedValue(note ?? "")
    setLocalValue(note ?? "")
  }

  const { mutate: save } = useMutation({
    mutationFn: (nextNote: string) =>
      updatePurchaseRequestNoteFn({
        data: { purchaseRequestId, note: nextNote || null },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
    onError: (error) => {
      toast.error(error.message)
      setLocalValue(note ?? "")
    },
  })

  if (!editable) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Ghi chú
        </p>
        <p className="text-sm font-medium whitespace-pre-wrap text-foreground">
          {note ?? "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label
        htmlFor="purchase-request-note"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Ghi chú
      </label>
      <Textarea
        id="purchase-request-note"
        className="min-h-20 w-full resize-y bg-background text-sm"
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
