import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { Button } from "@/components/ui/button"
import { createStandaloneOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/create-standalone-outsourcing-order.api"
import { updateStandaloneOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/update-standalone-outsourcing-order.api"
import { StandaloneOutsourcingOrderInfoSection } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderInfoSection"
import { StandaloneOutsourcingOrderItemsSection } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderItemsSection"
import {
  standaloneOutsourcingOrderFormDefaultValues,
  standaloneOutsourcingOrderSchema,
} from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import type { StandaloneOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { useAppForm } from "@/hooks/use-app-form"

type StandaloneOutsourcingOrderFormProps = {
  // Có `editing` thì lưu bằng PATCH và quay về chi tiết phiếu, không thì tạo nháp mới.
  editing?: {
    outsourcingOrderId: string
    defaultValues: StandaloneOutsourcingOrderSchema
    supplierOption: ComboboxOption
    operationOption: ComboboxOption
  }
}

// Phiếu thủ công trên một màn hình: lưu luôn ở trạng thái Nháp, gửi duyệt ở trang chi tiết.
export function StandaloneOutsourcingOrderForm({
  editing,
}: StandaloneOutsourcingOrderFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createOrderFn = useServerFn(createStandaloneOutsourcingOrder)
  const updateOrderFn = useServerFn(updateStandaloneOutsourcingOrder)

  const leaveForm = () =>
    editing
      ? navigate({
          to: "/manage/outsourcing-orders/$outsourcingOrderId",
          params: { outsourcingOrderId: editing.outsourcingOrderId },
        })
      : navigate({
          to: "/manage/outsourcing-orders",
          search: { page: 1, limit: 10 },
        })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (value: StandaloneOutsourcingOrderSchema) =>
      editing
        ? updateOrderFn({
            data: {
              outsourcingOrderId: editing.outsourcingOrderId,
              order: value,
            },
          })
        : createOrderFn({ data: value }),
    onSuccess: async () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      await queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })
      toast.success(
        editing
          ? "Đã lưu phiếu gia công ngoài"
          : "Đã lưu nháp phiếu gia công ngoài thủ công, cần gửi duyệt"
      )
      await leaveForm()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: editing
      ? editing.defaultValues
      : standaloneOutsourcingOrderFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: standaloneOutsourcingOrderSchema },
    onSubmit: ({ value }) => save(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        void form.handleSubmit()
      }}
      noValidate
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <StandaloneOutsourcingOrderInfoSection
          form={form}
          disabled={isPending}
          initialSupplierOption={editing?.supplierOption}
          initialOperationOption={editing?.operationOption}
        />
        <div className="border-t border-border">
          <StandaloneOutsourcingOrderItemsSection
            form={form}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() => void leaveForm()}
          >
            Thoát
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Đang lưu…"
              : editing
                ? "Lưu thay đổi"
                : "Lưu nháp phiếu"}
          </Button>
        </div>
      </div>
    </form>
  )
}
