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
import { deleteMaterial } from "@/features/materials/server-functions/delete-material"
import type { Material } from "@/features/materials/types/material.type"

type DeleteMaterialDialogProps = {
  material: Material
  trigger: ReactNode
}

// Only succeeds while the material has no transactions (see CLAUDE.md /
// backend rule) — the backend rejects otherwise and the dialog stays open
// showing the returned Vietnamese message, prompting "Ngừng sử dụng" instead.
export function DeleteMaterialDialog({
  material,
  trigger,
}: DeleteMaterialDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const deleteMaterialFn = useServerFn(deleteMaterial)

  const mutation = useMutation({
    mutationFn: () => deleteMaterialFn({ data: { materialId: material.id } }),
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
          <AlertDialogTitle>Xóa vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${material.name}" (${material.code}) sẽ bị xóa vĩnh viễn. Chỉ có thể xóa khi vật tư chưa phát sinh giao dịch nào (BOM, PO, nhập/xuất kho...).`}
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
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
