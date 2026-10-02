import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updatePurchaseRequestNote } from "@/features/purchase-requests/api/server-functions/update-purchase-request-note.api"
import { useHasPermission } from "@/hooks/use-permissions"

type PurchaseRequestNoteFieldProps = {
  purchaseRequestId: string
  note: string | null
}

// Giữ giá trị nhập trong state cục bộ + render-phase resync khi `note` từ server đổi, nhưng chỉ lưu
// khi bấm nút "Lưu" (không tự lưu khi rời ô nhập — người dùng thấy rõ khi nào ghi chú được ghi).
// Khác PurchaseOrderNoteField: sửa được ở MỌI trạng thái (BE `PATCH .../note` không chặn theo
// status), nên chỉ cần quyền, không cần DRAFT/REJECTED như phần sửa dòng vật tư của trang này.
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

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextNote: string) =>
      updatePurchaseRequestNoteFn({
        data: { purchaseRequestId, note: nextNote || null },
      }),
    onSuccess: async () => {
      toast.success("Đã lưu ghi chú")
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const isDirty = localValue !== (note ?? "")

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
        maxLength={1000}
        disabled={isPending}
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
      />
      <div className="flex justify-end gap-2 pt-1">
        {isDirty && !isPending && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLocalValue(note ?? "")}
          >
            Hủy thay đổi
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isPending}
          onClick={() => save(localValue)}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Lưu ghi chú
        </Button>
      </div>
    </div>
  )
}
