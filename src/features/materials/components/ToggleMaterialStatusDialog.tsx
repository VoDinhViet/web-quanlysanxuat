import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateMaterialStatus } from "@/features/materials/server-functions/update-material-status"
import { MaterialStatus } from "@/features/materials/types/material.type"
import type { Material } from "@/features/materials/types/material.type"

type ToggleMaterialStatusDialogProps = {
  material: Material
  trigger: ReactNode
}

// One dialog for both directions of the ACTIVE/INACTIVE toggle — the two
// confirmations only differ in copy, not behavior, so a status-derived branch
// here beats near-duplicate "deactivate"/"activate" dialog components.
export function ToggleMaterialStatusDialog({
  material,
  trigger,
}: ToggleMaterialStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const updateMaterialStatusFn = useServerFn(updateMaterialStatus)
  const isDeactivating = material.status === MaterialStatus.ACTIVE
  const nextStatus = isDeactivating
    ? MaterialStatus.INACTIVE
    : MaterialStatus.ACTIVE

  const mutation = useMutation({
    mutationFn: () =>
      updateMaterialStatusFn({
        data: { materialId: material.id, status: nextStatus },
      }),
    onSuccess: async () => {
      setOpen(false)
      await router.invalidate()
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
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDeactivating
              ? "Ngừng sử dụng vật tư này?"
              : "Kích hoạt lại vật tư này?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDeactivating
              ? `"${material.name}" sẽ chuyển sang trạng thái Ngừng sử dụng và không thể chọn khi tạo giao dịch mới.`
              : `"${material.name}" sẽ chuyển về trạng thái Đang sử dụng.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
