import { useState } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
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
import { copyProduct } from "@/features/products/server-functions/copy-product"
import type { Product } from "@/features/products/types/product.type"

type CopyProductDialogProps = {
  product: Product
  trigger: ReactNode
}

// Duplicates the product on the backend (POST /:id/copy → a fresh SPxxxx) and
// jumps straight to the copy's edit page so the user can tweak it right away.
export function CopyProductDialog({
  product,
  trigger,
}: CopyProductDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const router = useRouter()
  const copyProductFn = useServerFn(copyProduct)

  const mutation = useMutation({
    mutationFn: () => copyProductFn({ data: { productId: product.id } }),
    onSuccess: async (created) => {
      setOpen(false)
      toast.success(`Đã nhân bản thành ${created.code}`)
      await router.invalidate()
      await navigate({
        to: "/manage/products/$productId/edit",
        params: { productId: created.id },
      })
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
          <AlertDialogTitle>Nhân bản sản phẩm này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Tạo một bản sao của "${product.name}" (${product.code}) với mã mới. Bạn sẽ được chuyển tới trang chỉnh sửa bản sao ngay sau đó.`}
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
            {mutation.isPending ? "Đang nhân bản..." : "Nhân bản"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
