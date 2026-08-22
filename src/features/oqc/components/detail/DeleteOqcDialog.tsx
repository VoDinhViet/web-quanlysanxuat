import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TrashBinTrash } from "@solar-icons/react"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteOqc } from "@/features/oqc/api/server-functions/delete-oqc.api"
import type { Oqc } from "@/lib/types/oqc.type"

type DeleteOqcDialogProps = {
  oqc: Pick<Oqc, "id" | "code">
  trigger: ReactNode
  // Detail page navigates back to the list after deleting its own record; the list row (already
  // on the list) has nothing extra to do beyond invalidating + closing.
  onDeleted?: () => void
}

// Dùng chung ở cả OqcTableCells.tsx (nút Xoá trên danh sách) và OqcDetailActions.tsx (nút "Xoá
// phiếu" trên trang chi tiết) — mirror DeleteClientDialog.tsx (AlertDialog, không phải Dialog
// trần). Chỉ nên render khi `oqc.status === NOT_INSPECTED` — caller tự kiểm điều kiện đó trước khi
// render trigger (BE cũng chặn lại bằng E178 nếu không).
export function DeleteOqcDialog({
  oqc,
  trigger,
  onDeleted,
}: DeleteOqcDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteOqcFn = useServerFn(deleteOqc)

  const mutation = useMutation({
    mutationFn: () => deleteOqcFn({ data: { oqcId: oqc.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["oqc"] })
      onDeleted?.()
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // A previous failure shouldn't greet the user on reopen.
        if (next) mutation.reset()
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TrashBinTrash />
          </AlertDialogMedia>
          <AlertDialogTitle>Xoá phiếu OQC</AlertDialogTitle>
          <AlertDialogDescription>
            {`Bạn chắc chắn muốn xoá phiếu "${oqc.code}"? Thao tác này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xoá…" : "Xoá phiếu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
