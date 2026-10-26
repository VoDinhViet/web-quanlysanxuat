import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Undo2 } from "lucide-react"
import type { ReactElement } from "react"

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
import { rejectOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/reject-outsourcing-order.api"
import { rejectOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/reject-outsourcing-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type RejectOutsourcingOrderDialogProps = {
  order: OutsourcingOrderDetail
  trigger: ReactElement
}

// PENDING_APPROVAL → REJECTED, reason required — người lập sửa rồi gửi duyệt lại, khác Hủy (kết thúc
// hẳn). A Dialog (not AlertDialog) because it needs a text field.
export function RejectOutsourcingOrderDialog({
  order,
  trigger,
}: RejectOutsourcingOrderDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <RejectOutsourcingOrderForm
          order={order}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type RejectOutsourcingOrderFormProps = {
  order: OutsourcingOrderDetail
  onClose: () => void
}

function RejectOutsourcingOrderForm({
  order,
  onClose,
}: RejectOutsourcingOrderFormProps) {
  const queryClient = useQueryClient()
  const rejectOutsourcingOrderFn = useServerFn(rejectOutsourcingOrder)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectOutsourcingOrderFn({
        data: { outsourcingOrderId: order.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
    // A conflicting transition (someone else already approved / rejected it) leaves the page on a
    // stale status — refetch so the buttons match the real one while the error stays visible.
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] }),
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: rejectOutsourcingOrderSchema.pick({ reason: true }),
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
        <DialogTitle className="flex items-center gap-2 text-base font-medium">
          <Undo2 className="size-4 text-muted-foreground" />
          Từ chối phiếu {order.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Phiếu sẽ được trả về người lập để sửa. Sau khi sửa, người lập có thể
          gửi duyệt lại.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            maxLength={1000}
            placeholder="Nhập lý do từ chối để người lập chỉnh sửa"
          />
        )}
      </form.AppField>

      {mutation.error && (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      )}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Đóng
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Từ chối phiếu"}
        </Button>
      </DialogFooter>
    </form>
  )
}
