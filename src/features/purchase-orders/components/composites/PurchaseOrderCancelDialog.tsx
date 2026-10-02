import { revalidateLogic } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  ArrowRight,
  CheckCircle,
  CloseCircle,
  DocumentText,
  Lock,
  PenNewSquare,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactElement } from "react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cancelPurchaseOrder } from "@/features/purchase-orders/api/server-functions/cancel-purchase-order.api"
import { cancelPurchaseOrderSchema } from "@/features/purchase-orders/schemas/cancel-purchase-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { cn } from "cn"
import {
  PurchaseQuotationStatus,
  purchaseQuotationStatusLabels,
} from "@/lib/types/purchase-quotation.type"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCancelDialogProps = {
  purchaseOrder: PurchaseOrderDetail
  trigger: ReactElement
}

// PENDING_CONFIRMATION/ORDERED → CANCELLED (terminal), reason required — mirrors
// RejectQuotationDialog.tsx. A Dialog (not AlertDialog) because it needs a text field. When the PO
// came from an APPROVED RFQ the user also picks what happens to that RFQ: leave it alone ("Không
// mua nữa") or reopen it to DRAFT so the price can be fixed and re-approved.
export function PurchaseOrderCancelDialog({
  purchaseOrder,
  trigger,
}: PurchaseOrderCancelDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh each time the dialog opens. */}
        <PurchaseOrderCancelForm
          purchaseOrder={purchaseOrder}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type PurchaseOrderCancelFormProps = {
  purchaseOrder: PurchaseOrderDetail
  onClose: () => void
}

function PurchaseOrderCancelForm({
  purchaseOrder,
  onClose,
}: PurchaseOrderCancelFormProps) {
  const queryClient = useQueryClient()
  const cancelPurchaseOrderFn = useServerFn(cancelPurchaseOrder)

  const quotation = purchaseOrder.quotation
  const showQuotationChoice =
    !!quotation &&
    purchaseOrder.quotationStatus === PurchaseQuotationStatus.APPROVED
  const [reopenQuotation, setReopenQuotation] = useState(false)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      cancelPurchaseOrderFn({
        data: {
          purchaseOrderId: purchaseOrder.id,
          reason,
          reopenQuotation: showQuotationChoice ? reopenQuotation : undefined,
        },
      }),
    onSuccess: async () => {
      onClose()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase-quotations"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase-ledger"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] }),
      ])
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: cancelPurchaseOrderSchema.pick({ reason: true }),
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
          Huỷ đơn mua hàng {purchaseOrder.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Đơn mua hàng sẽ chuyển sang trạng thái "Đã hủy" và không thể khôi
          phục.
          {purchaseOrder.canClose || purchaseOrder.closeBlockedBy.length > 0
            ? " Muốn dừng phần hàng chưa về nhưng giữ phần đã nhập? Hãy dùng Đóng sớm PO."
            : null}
        </DialogDescription>
      </DialogHeader>

      {showQuotationChoice ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Xử lý báo giá <span className="font-mono">{quotation.code}</span>{" "}
            sau khi huỷ
          </p>
          <RadioGroup
            value={reopenQuotation ? "reopen" : "keep"}
            onValueChange={(value) => setReopenQuotation(value === "reopen")}
            className="gap-2"
          >
            <QuotationChoice
              value="reopen"
              checked={reopenQuotation}
              disabled={!purchaseOrder.canReopenQuotation}
              icon={PenNewSquare}
              tone="info"
              title="Mở lại báo giá để sửa giá và đặt lại"
              description="Các đơn chờ xác nhận khác của báo giá này sẽ bị xoá và tự tạo lại khi duyệt lại."
              flow={[
                {
                  label: "Đơn mua hàng: Đã hủy",
                  tone: "destructive",
                  icon: CloseCircle,
                },
                {
                  label: `${quotation.code}: ${purchaseQuotationStatusLabels[PurchaseQuotationStatus.DRAFT]}`,
                  tone: "warning",
                  icon: DocumentText,
                },
                {
                  label: "Sửa giá → duyệt lại → đặt lại",
                  tone: "success",
                  icon: CheckCircle,
                },
              ]}
            />
            <QuotationChoice
              value="keep"
              checked={!reopenQuotation}
              icon={Lock}
              tone="warning"
              title="Không mua nữa"
              description="Nếu đây là đơn cuối cùng của báo giá, báo giá cũng được huỷ để dòng đề xuất quay về Chờ mua."
              flow={[
                {
                  label: "Đơn mua hàng: Đã hủy",
                  tone: "destructive",
                  icon: CloseCircle,
                },
                {
                  label: `${quotation.code}: ${purchaseQuotationStatusLabels[PurchaseQuotationStatus.CANCELLED]} (nếu hết đơn)`,
                  tone: "destructive",
                  icon: CloseCircle,
                },
              ]}
            />
          </RadioGroup>
          {purchaseOrder.reopenBlockedBy.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa thể mở lại báo giá vì còn đơn đã đặt hàng:{" "}
              {purchaseOrder.reopenBlockedBy.map((blocker, index) => (
                <span key={blocker.id}>
                  {index > 0 ? ", " : null}
                  <Link
                    to="/manage/purchase-orders/$purchaseOrderId"
                    params={{ purchaseOrderId: blocker.id }}
                    className="font-mono text-primary hover:underline"
                  >
                    {blocker.code}
                  </Link>
                </span>
              ))}
              . Huỷ các đơn đó trước.
            </p>
          ) : null}
        </div>
      ) : null}

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do huỷ"
            required
            placeholder="Nhập lý do huỷ đơn mua hàng"
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
          {mutation.isPending ? "Đang xử lý..." : "Huỷ đơn"}
        </Button>
      </DialogFooter>
    </form>
  )
}

type ChoiceTone = "info" | "warning" | "success" | "destructive"

type FlowStep = {
  label: string
  tone: ChoiceTone
  icon: ComponentType<IconProps>
}

type QuotationChoiceProps = {
  value: string
  checked: boolean
  disabled?: boolean
  icon: ComponentType<IconProps>
  tone: ChoiceTone
  title: string
  description: string
  flow: FlowStep[]
}

const toneStyles: Record<ChoiceTone, string> = {
  info: "bg-info/10 text-info",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
}

function QuotationChoice({
  value,
  checked,
  disabled,
  icon: Icon,
  tone,
  title,
  description,
  flow,
}: QuotationChoiceProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        checked ? "border-primary bg-primary/5" : "hover:bg-muted/40",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          toneStyles[tone]
        )}
      >
        <Icon weight="Bold" className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-sm font-semibold uppercase">{title}</span>
        <span className="text-xs leading-normal text-muted-foreground">
          {description}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {flow.map((step, index) => (
            <span key={step.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <ArrowRight className="size-3 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  toneStyles[step.tone]
                )}
              >
                <step.icon weight="Bold" className="size-3" />
                {step.label}
              </span>
            </span>
          ))}
        </span>
      </span>
      <RadioGroupItem value={value} disabled={disabled} className="mt-0.5" />
    </label>
  )
}
