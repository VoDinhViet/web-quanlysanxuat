import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CircleX } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { rejectPurchaseRequest } from "@/features/purchase-requests/api/server-functions/reject-purchase-request.api"
import { rejectPurchaseRequestSchema } from "@/features/purchase-requests/schemas/reject-purchase-request.schema"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type RejectPurchaseRequestDialogProps = {
  purchaseRequest: PurchaseRequestDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → REJECTED, reason required — director-level (purchase-requests:approve). A
// Dialog (not AlertDialog) because it needs an input field, not just a confirm/cancel choice —
// same split as RejectOrderDialog.tsx.
export function RejectPurchaseRequestDialog({
  purchaseRequest,
  trigger,
}: RejectPurchaseRequestDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <RejectPurchaseRequestForm
          purchaseRequest={purchaseRequest}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}

type RejectPurchaseRequestFormProps = {
  purchaseRequest: PurchaseRequestDetail
  onClose: () => void
}

function RejectPurchaseRequestForm({
  purchaseRequest,
  onClose,
}: RejectPurchaseRequestFormProps) {
  const queryClient = useQueryClient()
  const rejectPurchaseRequestFn = useServerFn(rejectPurchaseRequest)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectPurchaseRequestFn({
        data: { purchaseRequestId: purchaseRequest.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validators: {
      onSubmit: rejectPurchaseRequestSchema.pick({ reason: true }),
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
          <CircleX className="size-4 text-destructive" />
          Từ chối đề xuất {purchaseRequest.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Đề xuất sẽ chuyển sang trạng thái "Từ chối". Cần sửa hoặc xóa một dòng
          vật tư để đưa đề xuất về Nháp trước khi gửi duyệt lại.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            placeholder="Nhập lý do từ chối đề xuất"
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
          onPress={onClose}
          isDisabled={mutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="destructive"
          isDisabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Từ chối"}
        </Button>
      </DialogFooter>
    </form>
  )
}
