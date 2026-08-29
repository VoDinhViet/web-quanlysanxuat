import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CloseCircle } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { rejectOrder } from "@/features/orders/api/server-functions/reject-order.api"
import { rejectOrderSchema } from "@/features/orders/schemas/reject-order.schema"
import type { OrderDetail } from "@/lib/types/order.type"

type RejectOrderDialogProps = {
  order: OrderDetail
  trigger: ReactNode
}

// PENDING_CONFIRMATION → REJECTED, reason required — director-level (orders:approve). A Dialog
// (not AlertDialog) because it needs an input field, not just a confirm/cancel choice.
export function RejectOrderDialog({ order, trigger }: RejectOrderDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {/* Radix unmounts content while closed, so the form (and its mutation
            state) re-mounts fresh each time the dialog opens. */}
        <RejectOrderForm order={order} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

type RejectOrderFormProps = {
  order: OrderDetail
  onClose: () => void
}

function RejectOrderForm({ order, onClose }: RejectOrderFormProps) {
  const queryClient = useQueryClient()
  const rejectOrderFn = useServerFn(rejectOrder)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectOrderFn({ data: { orderId: order.id, reason } }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validators: {
      onSubmit: rejectOrderSchema.pick({ reason: true }),
    },
    onSubmit: ({ value }) => mutation.mutate(value.reason),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <CloseCircle className="size-4 text-destructive" />
          Từ chối đơn hàng {order.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Đơn hàng sẽ chuyển sang trạng thái "Từ chối". Nhân viên kinh doanh có
          thể gửi duyệt lại ngay, hoặc sửa lại (đơn sẽ tự về "Nháp").
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            placeholder="Nhập lý do từ chối đơn hàng"
          />
        )}
      </form.AppField>

      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Từ chối"}
        </Button>
      </DialogFooter>
    </form>
  )
}
