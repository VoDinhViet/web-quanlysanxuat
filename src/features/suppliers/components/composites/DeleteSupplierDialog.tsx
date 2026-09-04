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
import { deleteSupplier } from "@/features/suppliers/api/server-functions/delete-supplier.api"
import type { Supplier } from "@/lib/types/supplier.type"

type DeleteSupplierDialogProps = {
  supplier: Supplier
  trigger: ReactNode
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
    <AlertDialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <AlertDialog>
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
