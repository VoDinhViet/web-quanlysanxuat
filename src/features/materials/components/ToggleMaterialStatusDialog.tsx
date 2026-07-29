import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck, CirclePause } from "lucide-react"
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
import { updateMaterialStatus } from "@/features/materials/api/server-functions/update-material-status.api"
import { MaterialStatus } from "@/lib/types/material.type"
import type { Material } from "@/lib/types/material.type"

type ToggleMaterialStatusDialogProps = {
  material: Material
  trigger: ReactNode
}

// One dialog for both directions of the ACTIVE/INACTIVE toggle — the two
// confirmations only differ in copy, not behavior, so a status-derived branch
// here beats near-duplicate "deactivate"/"activate" dialog components.
function getStatusConfig(material: Material) {
  if (material.status === MaterialStatus.ACTIVE) {
    return {
      nextStatus: MaterialStatus.INACTIVE,
      icon: CirclePause,
      title: "Ngừng sử dụng vật tư này?",
      description: `"${material.name}" sẽ chuyển sang trạng thái Ngừng sử dụng và không thể chọn khi tạo giao dịch mới.`,
    }
  }

  return {
    nextStatus: MaterialStatus.ACTIVE,
    icon: CircleCheck,
    title: "Kích hoạt lại vật tư này?",
    description: `"${material.name}" sẽ chuyển về trạng thái Đang sử dụng.`,
  }
}

export function ToggleMaterialStatusDialog({
  material,
  trigger,
}: ToggleMaterialStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const updateMaterialStatusFn = useServerFn(updateMaterialStatus)
  const {
    nextStatus,
    icon: Icon,
    title,
    description,
  } = getStatusConfig(material)

  const mutation = useMutation({
    mutationFn: () =>
      updateMaterialStatusFn({
        data: { materialId: material.id, status: nextStatus },
      }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["materials"] })
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
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
