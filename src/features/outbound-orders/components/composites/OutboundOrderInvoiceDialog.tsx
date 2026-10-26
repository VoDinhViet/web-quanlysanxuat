import { useState } from "react"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Receipt } from "lucide-react"
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
import { useAppForm } from "@/hooks/use-app-form"
import { updateOutboundOrderInvoice } from "@/features/outbound-orders/api/server-functions/update-outbound-order-invoice.api"
import { updateOutboundOrderInvoiceSchema } from "@/features/outbound-orders/schemas/update-outbound-order-invoice.schema"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderInvoiceDialogProps = {
  order: OutboundOrderDetail
  trigger: ReactElement
}

// Lưu là DO tự thành "Đã xuất"; mở lại để sửa số/ngày hóa đơn. Dùng Dialog (không phải AlertDialog)
// vì có ô nhập.
export function OutboundOrderInvoiceDialog({
  order,
  trigger,
}: OutboundOrderInvoiceDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {/* Dialog gỡ nội dung khi đóng, nên form (và trạng thái mutation) dựng mới mỗi lần mở. */}
        <OutboundOrderInvoiceForm
          order={order}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type OutboundOrderInvoiceFormProps = {
  order: OutboundOrderDetail
  onClose: () => void
}

function OutboundOrderInvoiceForm({
  order,
  onClose,
}: OutboundOrderInvoiceFormProps) {
  const queryClient = useQueryClient()
  const updateOutboundOrderInvoiceFn = useServerFn(updateOutboundOrderInvoice)

  const mutation = useMutation({
    mutationFn: (invoice: { invoiceNo: string; invoiceDate: string }) =>
      updateOutboundOrderInvoiceFn({
        data: { outboundOrderId: order.id, ...invoice },
      }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
    },
  })

  const form = useAppForm({
    defaultValues: {
      invoiceNo: order.invoiceNo ?? "",
      invoiceDate: order.invoiceDate?.slice(0, 10) ?? "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateOutboundOrderInvoiceSchema.pick({
        invoiceNo: true,
        invoiceDate: true,
      }),
    },
    onSubmit: ({ value }) => mutation.mutate(value),
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
          <Receipt className="size-4 text-muted-foreground" />
          Hóa đơn giao hàng {order.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Lưu xong phiếu chuyển sang hóa đơn "Đã xuất". Có thể mở lại để sửa.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="invoiceNo">
        {(field) => (
          <field.TextField
            label="Số hóa đơn"
            required
            placeholder="Nhập số hóa đơn"
          />
        )}
      </form.AppField>

      <form.AppField name="invoiceDate">
        {(field) => <field.DateField label="Ngày xuất hóa đơn" required />}
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
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang lưu..." : "Lưu hóa đơn"}
        </Button>
      </DialogFooter>
    </form>
  )
}
