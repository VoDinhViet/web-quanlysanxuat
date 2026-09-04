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
import { deleteOperation } from "@/features/operations/api/server-functions/delete-operation.api"
import type { OperationDetail } from "@/lib/types/operation.type"

type DeleteOperationDialogProps = {
  operation: OperationDetail
  trigger: ReactNode
}

export function DeleteOperationDialog({
  operation,
  trigger,
}: DeleteOperationDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteOperationFn = useServerFn(deleteOperation)

  const mutation = useMutation({
    mutationFn: () =>
      deleteOperationFn({ data: { operationId: operation.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["operations"] })
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
          <AlertDialogTitle>Xóa công đoạn này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${operation.name}" (${operation.code}) sẽ bị xóa khỏi danh mục công đoạn. Công đoạn đang được dùng trong quy trình/BOM sẽ không xóa được.`}
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
