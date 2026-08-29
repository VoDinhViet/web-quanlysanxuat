import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Diskette } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CreatePurchaseOrderInfoSection } from "@/features/purchase-orders/components/sections/CreatePurchaseOrderInfoSection"
import { CreatePurchaseOrderItemsPickerSection } from "@/features/purchase-orders/components/sections/CreatePurchaseOrderItemsPickerSection"
import { CreatePurchaseOrderItemsSection } from "@/features/purchase-orders/components/sections/CreatePurchaseOrderItemsSection"
import { createPurchaseOrder } from "@/features/purchase-orders/api/server-functions/create-purchase-order.api"
import {
  createPurchaseOrderFormDefaultValues,
  createPurchaseOrderFormSchema,
} from "@/features/purchase-orders/schemas/create-purchase-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import type { CreatePurchaseOrderFormSchema } from "@/features/purchase-orders/schemas/create-purchase-order.schema"

// Single-page form, unlike CreateQuotationForm's 2-step wizard — a PO lập tay has no per-item NCC
// comparison step (supplier is one header field, chosen up front), so picker + picked-items table
// + submit all fit on one screen.
export function CreatePurchaseOrderForm() {
  const navigate = useNavigate({ from: "/manage/purchase-orders/create" })
  const queryClient = useQueryClient()
  const createPurchaseOrderFn = useServerFn(createPurchaseOrder)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreatePurchaseOrderFormSchema) =>
      createPurchaseOrderFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast.success("Đã tạo đơn mua")
      await navigate({
        to: "/manage/purchase-orders",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createPurchaseOrderFormDefaultValues,
    validators: { onSubmit: createPurchaseOrderFormSchema },
    onSubmit: ({ value }) => create(value),
  })

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <CreatePurchaseOrderInfoSection form={form} disabled={isPending} />

        <div className="border-t border-border">
          <CreatePurchaseOrderItemsPickerSection
            form={form}
            disabled={isPending}
          />
        </div>

        <div className="border-t border-border">
          <CreatePurchaseOrderItemsSection form={form} disabled={isPending} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/purchase-orders",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang tạo
                  </>
                ) : (
                  <>
                    <Diskette />
                    Tạo PO
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
