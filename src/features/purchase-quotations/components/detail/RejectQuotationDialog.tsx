import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
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
import { rejectPurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/reject-purchase-quotation.api"
import { rejectPurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/reject-purchase-quotation.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type RejectQuotationDialogProps = {
  detail: PurchaseQuotationDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → CANCELLED (terminal), reason required — mirrors
// RejectPurchaseRequestDialog.tsx. A Dialog (not AlertDialog) because it needs an input field.
export function RejectQuotationDialog({
  detail,
  trigger,
}: RejectQuotationDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {/* Radix unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <RejectQuotationForm detail={detail} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

type RejectQuotationFormProps = {
  detail: PurchaseQuotationDetail
  onClose: () => void
}

function RejectQuotationForm({ detail, onClose }: RejectQuotationFormProps) {
  const queryClient = useQueryClient()
  const rejectPurchaseQuotationFn = useServerFn(rejectPurchaseQuotation)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectPurchaseQuotationFn({
        data: { purchaseQuotationId: detail.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({
        queryKey: ["purchase-quotations"],
      })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validators: {
      onSubmit: rejectPurchaseQuotationSchema.pick({ reason: true }),
    },
    onSubmit: ({ value }) => mutation.mutate(value.reason),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <CloseCircle className="size-4 text-destructive" />
          Từ chối báo giá {detail.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Báo giá sẽ chuyển sang trạng thái "Đã hủy". Đây là quyết định cuối —
          không có đường quay lại, cần tạo RFQ mới nếu vẫn cần mua các vật tư
          này.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            placeholder="Nhập lý do từ chối báo giá"
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
