import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateOrderInfoSection } from "@/features/orders/components/create/CreateOrderInfoSection"
import { CreateOrderItemsSection } from "@/features/orders/components/create/CreateOrderItemsSection"
import { CreateOrderTotalsSummary } from "@/features/orders/components/create/CreateOrderTotalsSummary"
import { OrderDocumentsField } from "@/features/orders/components/OrderDocumentsField"
import {
  createOrderFormDefaultValues,
  createOrderSchema,
} from "@/features/orders/schemas/create-order.schema"
import { createOrder } from "@/features/orders/api/server-functions/create-order.api"
import type { CreateOrderSchema } from "@/features/orders/schemas/create-order.schema"

export function CreateOrderForm() {
  const navigate = useNavigate({ from: "/manage/orders/create" })
  const queryClient = useQueryClient()
  const createOrderFn = useServerFn(createOrder)

  // v3: field `attachments` đổi tên thành `files` (attachments-to-files-registry rename) — bump
  // để nháp cũ (còn field `attachments`) không âm thầm làm rớt file đã đính kèm khi khôi phục.
  const { draft, saveDraft, clearDraft } = useFormDraft<CreateOrderSchema>(
    "qlsx:draft:create-order-v3"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateOrderSchema) => createOrderFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await navigate({ to: "/manage/orders", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOrderFormDefaultValues,
    validators: {
      onSubmit: createOrderSchema,
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <CreateOrderInfoSection form={form} disabled={isPending} />

          <div className="border-t border-border">
            <CreateOrderItemsSection form={form} disabled={isPending} />
          </div>

          <div className="border-t border-border px-4 py-5 sm:px-5">
            <form.Field name="files">
              {(field) => (
                <OrderDocumentsField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>
        </div>

        <div className="sticky top-6 h-fit rounded-lg bg-card p-4 shadow-card sm:p-5">
          <CreateOrderTotalsSummary form={form} disabled={isPending} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
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
              restoreFormDraft(form, createOrderFormDefaultValues)
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
    </form>
  )
}
