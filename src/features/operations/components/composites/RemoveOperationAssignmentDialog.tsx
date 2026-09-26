import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TrashBinTrash } from "@solar-icons/react"
import { toast } from "sonner"
import type { ReactElement } from "react"

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
import { operationAssignmentIdsQueryOptions } from "@/features/operations/api/options"
import { setOperationAssignments } from "@/features/operations/api/server-functions/set-operation-assignments.api"
import type { UserListItem } from "@/lib/types/user.type"

type RemoveOperationAssignmentDialogProps = {
  operationId: string
  user: UserListItem
  trigger: ReactElement
}

export function RemoveOperationAssignmentDialog({
  operationId,
  user,
  trigger,
}: RemoveOperationAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const setOperationAssignmentsFn = useServerFn(setOperationAssignments)

  const mutation = useMutation({
    mutationFn: async () => {
      // The endpoint replaces the whole list, so re-read the current ids right now instead of
      // trusting a cached copy that another session may have changed.
      const currentIds = await queryClient.query({
        ...operationAssignmentIdsQueryOptions(operationId),
        staleTime: 0,
      })

      await setOperationAssignmentsFn({
        data: {
          operationId,
          userIds: currentIds.filter((userId) => userId !== user.id),
        },
      })
    },
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ["operations", "assignments"],
      })
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
            <TrashBinTrash />
          </AlertDialogMedia>
          <AlertDialogTitle>Gỡ nhân sự khỏi công đoạn?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${user.fullName}" (${user.code}) sẽ không còn được phân công vào công đoạn này. Nhân sự vẫn thuộc các công đoạn khác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Thoát
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
