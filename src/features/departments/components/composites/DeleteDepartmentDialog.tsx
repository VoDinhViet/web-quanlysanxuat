import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ReactElement } from "react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteDepartment } from "@/features/departments/api/server-functions/delete-department.api"
import type { Department } from "@/lib/types/department.type"

type DeleteDepartmentDialogProps = {
  department: Department
  trigger: ReactElement
  // The detail page navigates back to the list once its own department is gone; the list row's
  // own delete action has nowhere to navigate, so it omits this.
  onSuccess?: () => void
}

export function DeleteDepartmentDialog({
  department,
  trigger,
  onSuccess,
}: DeleteDepartmentDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteDepartmentFn = useServerFn(deleteDepartment)

  const mutation = useMutation({
    mutationFn: () =>
      deleteDepartmentFn({ data: { departmentId: department.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["departments"] })
      onSuccess?.()
    },
    onError: (error) => {
      setOpen(false)
      toast.error(error.message)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa phòng ban này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${department.name}" (${department.code}) sẽ bị xóa khỏi danh mục phòng ban. Phòng ban đang có chức vụ hoặc nhân sự sẽ không xóa được.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
