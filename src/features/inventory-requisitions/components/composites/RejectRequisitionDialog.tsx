import { revalidateLogic } from "@tanstack/react-form"
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
import { rejectInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/reject-inventory-requisition.api"
import { rejectInventoryRequisitionSchema } from "@/features/inventory-requisitions/schemas/reject-inventory-requisition.schema"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type RejectRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → REJECTED, lý do bắt buộc. A Dialog (not AlertDialog) because it needs an
// input field, not just a confirm/cancel choice — same split as RejectPurchaseRequestDialog.tsx.
export function RejectRequisitionDialog({
  detail,
  trigger,
}: RejectRequisitionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <RejectRequisitionForm detail={detail} onClose={() => setOpen(false)} />
      </Dialog>
    </DialogTrigger>
  )
}

type RejectRequisitionFormProps = {
  detail: InventoryRequisitionDetail
  onClose: () => void
}

function RejectRequisitionForm({
  detail,
  onClose,
}: RejectRequisitionFormProps) {
  const queryClient = useQueryClient()
  const rejectInventoryRequisitionFn = useServerFn(rejectInventoryRequisition)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectInventoryRequisitionFn({
        data: { requisitionId: detail.id, reason },
      }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({
        queryKey: ["inventory-requisitions"],
      })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: rejectInventoryRequisitionSchema.pick({ reason: true }),
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
          Từ chối phiếu lãnh vật tư {detail.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Phiếu sẽ chuyển sang trạng thái "Từ chối" — có thể gửi duyệt lại sau
          khi sửa.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do từ chối"
            required
            placeholder="Nhập lý do từ chối phiếu lãnh vật tư"
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
