import { Flame } from "lucide-react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updatePaymentRequestUrgency } from "@/features/payment-requests/api/server-functions/update-payment-request-urgency.api"
import { PaymentRequestUrgentBadge } from "@/features/payment-requests/components/primitives/PaymentRequestBadges"
import { cn } from "@/lib/utils"

type PaymentRequestUrgencyToggleProps = {
  paymentRequestId: string
  isUrgent: boolean
  editable: boolean
}

// Nút bật/tắt "Gấp" nằm liền nhóm trạng thái ở đầu trang chi tiết (PH-133); hết chờ thanh toán
// thì chỉ còn nhãn "Gấp" nếu YCTT đó gấp.
export function PaymentRequestUrgencyToggle({
  paymentRequestId,
  isUrgent,
  editable,
}: PaymentRequestUrgencyToggleProps) {
  const queryClient = useQueryClient()
  const updateUrgencyFn = useServerFn(updatePaymentRequestUrgency)

  const { mutate: saveUrgency, isPending } = useMutation({
    mutationFn: (nextIsUrgent: boolean) =>
      updateUrgencyFn({
        data: { paymentRequestId, isUrgent: nextIsUrgent },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
    onError: (error) => toast.error(error.message),
  })

  if (!editable) {
    return isUrgent ? <PaymentRequestUrgentBadge /> : null
  }

  return (
    <button
      type="button"
      aria-pressed={isUrgent}
      disabled={isPending}
      title={
        isUrgent
          ? "Bấm để chuyển về bình thường"
          : "Đánh dấu yêu cầu thanh toán gấp, cần chi sớm"
      }
      onClick={() => saveUrgency(!isUrgent)}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors disabled:opacity-60",
        isUrgent
          ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "border-dashed border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
      )}
    >
      <Flame className={cn("size-3", isUrgent && "fill-current")} />
      {isUrgent ? "Gấp" : "Đánh dấu gấp"}
    </button>
  )
}
