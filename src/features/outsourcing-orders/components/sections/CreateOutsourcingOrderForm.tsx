import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateOutsourcingOrderConfirmSection } from "@/features/outsourcing-orders/components/sections/CreateOutsourcingOrderConfirmSection"
import { CreateOutsourcingOrderInfoSection } from "@/features/outsourcing-orders/components/sections/CreateOutsourcingOrderInfoSection"
import { CreateOutsourcingOrderItemsSection } from "@/features/outsourcing-orders/components/sections/CreateOutsourcingOrderItemsSection"
import { CreateOutsourcingOrderPickerSection } from "@/features/outsourcing-orders/components/sections/CreateOutsourcingOrderPickerSection"
import {
  CreateOutsourcingOrderTabs,
  wizardTabs,
} from "@/features/outsourcing-orders/components/sections/CreateOutsourcingOrderTabs"
import { createOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/create-outsourcing-order.api"
import {
  createOutsourcingOrderFormDefaultValues,
  createOutsourcingOrderSchema,
} from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import type { CreateOutsourcingOrderWizardTab } from "@/features/outsourcing-orders/components/sections/CreateOutsourcingOrderTabs"
import type { CreateOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

type CreateOutsourcingOrderFormProps = {
  // Deep-link tuỳ chọn từ nút "Gửi gia công ngoài" trên bảng công đoạn của 1 Job
  // (ProductionJobOperationsTable.tsx) — chỉ seed giá trị khởi tạo cho 2 filter của picker, không
  // đổi hành vi chọn dòng nào khác.
  initialProductionJobId?: string
  initialOperationId?: string
}

// Vỏ wizard "Tạo phiếu OS-OUT" — rập khuôn InventoryReceiptCreateFromPoForm.tsx/
// PurchaseRequestCreateForm.tsx, 3 tab, không có "Lưu nháp" riêng (chỉ 1 hành động submit —
// POST /outsourcing-orders luôn tạo ở trạng thái DRAFT).
export function CreateOutsourcingOrderForm({
  initialProductionJobId,
  initialOperationId,
}: CreateOutsourcingOrderFormProps) {
  const navigate = useNavigate({ from: "/manage/outsourcing-orders/create" })
  const queryClient = useQueryClient()
  const createOutsourcingOrderFn = useServerFn(createOutsourcingOrder)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateOutsourcingOrderSchema>(
      "qlsx:draft:create-outsourcing-order-v5"
    )
  const draftRestoredRef = useRef(false)

  const [tab, setTab] = useState<CreateOutsourcingOrderWizardTab>("picker")

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateOutsourcingOrderSchema) =>
      createOutsourcingOrderFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })
      toast.success("Đã tạo phiếu xuất đi gia công (OS-OUT)")
      await navigate({
        to: "/manage/outsourcing-orders",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOutsourcingOrderFormDefaultValues,
    validators: {
      onSubmit: createOutsourcingOrderSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  function handleTabChange(nextTab: CreateOutsourcingOrderWizardTab) {
    setTab(nextTab)
    saveDraft(form.state.values)
  }

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast, and an
  // unrecognised value simply doesn't switch tabs. Delegates to the typed `handleTabChange`
  // above so the draft-on-tab-change behavior stays in one place.
  function handleTabValueChange(value: string) {
    const nextTab = wizardTabs.find((item) => item.value === value)

    if (nextTab) {
      handleTabChange(nextTab.value)
    }
  }

  const tabIndex = wizardTabs.findIndex((t) => t.value === tab)
  const prevTab = tabIndex > 0 ? wizardTabs[tabIndex - 1] : undefined
  const nextTab =
    tabIndex < wizardTabs.length - 1 ? wizardTabs[tabIndex + 1] : undefined

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
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <Tabs
          value={tab}
          onValueChange={handleTabValueChange}
          className="gap-0"
        >
          <form.Subscribe
            selector={(state) => ({
              hasItems: state.values.items.length > 0,
              hasTabTwoInfo: Boolean(
                state.values.supplierId && state.values.sendDate
              ),
            })}
          >
            {({ hasItems, hasTabTwoInfo }) => (
              <CreateOutsourcingOrderTabs
                canGoToItems={hasItems}
                canGoToConfirm={hasItems && hasTabTwoInfo}
              />
            )}
          </form.Subscribe>

          <TabsContent value="picker" className="m-0 outline-none">
            <CreateOutsourcingOrderPickerSection
              form={form}
              disabled={isPending}
              initialProductionJobId={initialProductionJobId}
              initialOperationId={initialOperationId}
            />
          </TabsContent>
          <TabsContent value="items" className="m-0 outline-none">
            <CreateOutsourcingOrderInfoSection
              form={form}
              disabled={isPending}
            />
            <div className="border-t border-border">
              <CreateOutsourcingOrderItemsSection
                form={form}
                disabled={isPending}
              />
            </div>
          </TabsContent>
          <TabsContent value="confirm" className="m-0 outline-none">
            <CreateOutsourcingOrderConfirmSection form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          {prevTab ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => handleTabChange(prevTab.value)}
            >
              <AltArrowLeft className="size-4" />
              Quay lại
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() =>
                void navigate({
                  to: "/manage/outsourcing-orders",
                  search: { page: 1, limit: 10 },
                })
              }
            >
              Hủy
            </Button>
          )}

          {nextTab ? (
            <form.Subscribe
              selector={(state) => ({
                hasItems: state.values.items.length > 0,
                hasTabTwoInfo: Boolean(
                  state.values.supplierId && state.values.sendDate
                ),
              })}
            >
              {({ hasItems, hasTabTwoInfo }) => {
                const canAdvance =
                  tab === "picker" ? hasItems : hasItems && hasTabTwoInfo

                return (
                  <Button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => handleTabChange(nextTab.value)}
                  >
                    Tiếp theo: {nextTab.label}
                    <AltArrowRight className="size-4" />
                  </Button>
                )
              }}
            </form.Subscribe>
          ) : (
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isSubmitting || isPending}
                  onClick={() => {
                    if (form.state.isSubmitting) return
                    form.handleSubmit()
                  }}
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Đang tạo phiếu
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      Xác nhận tạo phiếu
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          )}
        </div>
      </div>
    </form>
  )
}
