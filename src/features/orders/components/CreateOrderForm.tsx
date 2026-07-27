import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { OrderAttachmentsField } from "@/features/orders/components/OrderAttachmentsField"
import { OrderInfoSection } from "@/features/orders/components/OrderInfoSection"
import { OrderItemsSection } from "@/features/orders/components/OrderItemsSection"
import { OrderTotalsSummary } from "@/features/orders/components/OrderTotalsSummary"
import {
  ORDER_FORM_DEFAULT_VALUES,
  orderFormSchema,
} from "@/features/orders/schemas/order-form.schema"
import { createOrder } from "@/features/orders/server-functions/create-order"
import type { OrderFormSchema } from "@/features/orders/schemas/order-form.schema"

export function CreateOrderForm() {
  const navigate = useNavigate({ from: "/manage/orders/create" })
  const queryClient = useQueryClient()
  const createOrderFn = useServerFn(createOrder)

  const { draft, saveDraft, clearDraft } = useFormDraft<OrderFormSchema>(
    "qlsx:draft:create-order"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: OrderFormSchema) => createOrderFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await navigate({ to: "/manage/orders", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: ORDER_FORM_DEFAULT_VALUES,
    validators: {
      onSubmit: orderFormSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <OrderInfoSection form={form} disabled={isPending} />

        <div className="border-t border-border">
          <OrderItemsSection form={form} disabled={isPending} />
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-border px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <form.Field name="attachments">
            {(field) => (
              <OrderAttachmentsField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={isPending}
              />
            )}
          </form.Field>

          <OrderTotalsSummary form={form} disabled={isPending} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/orders",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, ORDER_FORM_DEFAULT_VALUES)
                clearDraft()
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                saveDraft(form.state.values)
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
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
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <Save />
                      Tạo đơn hàng
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  )
}
