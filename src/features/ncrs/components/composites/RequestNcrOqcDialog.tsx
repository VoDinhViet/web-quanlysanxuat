import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { ClipboardCheck } from "lucide-react"
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
import { requestNcrOqc } from "@/features/ncrs/api/server-functions/request-ncr-oqc.api"
import { requestNcrOqcSchema } from "@/features/ncrs/schemas/request-ncr-oqc.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { NcrDetail } from "@/lib/types/ncr.type"

type RequestNcrOqcDialogProps = {
  ncr: NcrDetail
  trigger: ReactElement
}

// Creates a DRAFT OQC sheet on the source Job for the repaired / remade quantity — QC confirms
// it on the normal OQC screen, and a PASS closes the NCR.
export function RequestNcrOqcDialog({
  ncr,
  trigger,
}: RequestNcrOqcDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <RequestNcrOqcForm ncr={ncr} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

type RequestNcrOqcFormProps = {
  ncr: NcrDetail
  onClose: () => void
}

function RequestNcrOqcForm({ ncr, onClose }: RequestNcrOqcFormProps) {
  const queryClient = useQueryClient()
  const requestNcrOqcFn = useServerFn(requestNcrOqc)
  const processingQty = ncr.reworkQty + ncr.remakeQty

  const mutation = useMutation({
    mutationFn: (quantity: number | undefined) =>
      requestNcrOqcFn({ data: { ncrId: ncr.id, quantity } }),
    onSuccess: async () => {
      onClose()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ncrs"] }),
        queryClient.invalidateQueries({ queryKey: ["oqc"] }),
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
      ])
    },
  })

  const defaultValues: { quantity?: number } = { quantity: processingQty }

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: requestNcrOqcSchema.pick({ quantity: true }),
    },
    onSubmit: ({ value }) => mutation.mutate(value.quantity),
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
          <ClipboardCheck className="size-4 text-primary" />
          Yêu cầu OQC lại cho {ncr.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Tạo phiếu OQC mới trên Job gốc cho phần hàng đã sửa chữa / làm mới.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="quantity">
        {(field) => (
          <field.NumberField
            label="SL kiểm lại"
            required
            description={`Tối đa ${processingQty}`}
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
          Hủy
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang xử lý..." : "Tạo phiếu OQC"}
        </Button>
      </DialogFooter>
    </form>
  )
}
