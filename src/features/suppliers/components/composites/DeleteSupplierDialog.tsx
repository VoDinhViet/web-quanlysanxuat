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
import { deleteSupplier } from "@/features/suppliers/api/server-functions/delete-supplier.api"
import type { Supplier } from "@/lib/types/supplier.type"

type DeleteSupplierDialogProps = {
  supplier: Supplier
  trigger: ReactElement
}

export function DeleteSupplierDialog({
  supplier,
  trigger,
}: DeleteSupplierDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteSupplierFn = useServerFn(deleteSupplier)

  const mutation = useMutation({
    mutationFn: () => deleteSupplierFn({ data: { supplierId: supplier.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] })
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
          <AlertDialogTitle>Xóa nhà cung cấp này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${supplier.name}" (${supplier.code}) sẽ bị xóa khỏi danh sách nhà cung cấp.`}
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
