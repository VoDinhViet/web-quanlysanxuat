import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { updatePurchaseRequestNote } from "@/features/purchase-requests/api/server-functions/update-purchase-request-note.api"
import { useHasPermission } from "@/hooks/use-permissions"

type UsePurchaseRequestNoteResult = {
  editable: boolean
  value: string
  onChange: (nextValue: string) => void
  isDirty: boolean
  isPending: boolean
  save: () => void
}

// Giữ giá trị nhập trong state cục bộ + render-phase resync khi `note` từ server đổi, nhưng chỉ lưu
// khi bấm nút "Lưu" (không tự lưu khi rời ô nhập — người dùng thấy rõ khi nào ghi chú được ghi).
// Sửa được ở MỌI trạng thái (BE `PATCH .../note` không chặn theo status), nên chỉ cần quyền.
// Ô nhập và nút Lưu nằm ở 2 chỗ khác nhau của header nên state sống ở hook này, header gọi 1 lần.
export function usePurchaseRequestNote(
  purchaseRequestId: string,
  note: string | null
): UsePurchaseRequestNoteResult {
  const editable = useHasPermission("purchase-requests:update")
  const queryClient = useQueryClient()
  const updatePurchaseRequestNoteFn = useServerFn(updatePurchaseRequestNote)
  const [value, setValue] = useState(note ?? "")
  const [syncedValue, setSyncedValue] = useState(note ?? "")
  if ((note ?? "") !== syncedValue) {
    setSyncedValue(note ?? "")
    setValue(note ?? "")
  }

  const { mutate, isPending } = useMutation({
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

  return {
    editable,
    value,
    onChange: setValue,
    isDirty: value !== (note ?? ""),
    isPending,
    save: () => mutate(value),
  }
}

export type { UsePurchaseRequestNoteResult }
