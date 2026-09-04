import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteRole } from "@/features/roles/api/server-functions/delete-role.api"
import type { Role } from "@/lib/types/role.type"

type DeleteRoleDialogProps = {
  role: Role
  trigger: ReactNode
}

export function DeleteRoleDialog({ role, trigger }: DeleteRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteRoleFn = useServerFn(deleteRole)

  const mutation = useMutation({
    mutationFn: () => deleteRoleFn({ data: { roleId: role.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
    onError: (error) => {
      setOpen(false)
      toast.error(error.message)
    },
  })

  return (
    <AlertDialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa vai trò này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${role.name}" (${role.code}) sẽ bị xóa khỏi danh sách vai trò. Vai trò đang được gán cho tài khoản nào sẽ không xóa được.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            isDisabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
