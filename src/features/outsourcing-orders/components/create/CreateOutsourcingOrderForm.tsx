import { useEffect, useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CreateOutsourcingOrderConfirmSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderConfirmSection"
import { CreateOutsourcingOrderInfoSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderInfoSection"
import { CreateOutsourcingOrderItemsSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderItemsSection"
import { CreateOutsourcingOrderPickerSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderPickerSection"
import {
  CreateOutsourcingOrderTabs,
  wizardTabs,
} from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderTabs"
import { CreateOutsourcingOrderSuccessDialog } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderSuccessDialog"
import { createOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/create-outsourcing-order.api"
import { sumOutsourcingOrderItemTotals } from "@/features/outsourcing-orders/outsourcing-order-item-totals"
import {
  createOutsourcingOrderFormDefaultValues,
  createOutsourcingOrderSchema,
} from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import type { CreateOutsourcingOrderWizardTab } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderTabs"
import type { CreateOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

// Vỏ wizard "Tạo phiếu OS-OUT" — rập khuôn InventoryReceiptCreateFromPoForm.tsx/
// PurchaseRequestCreateForm.tsx, 3 tab, không có "Lưu nháp" riêng (chỉ 1 hành động submit —
// POST /outsourcing-orders luôn tạo ở trạng thái DRAFT).
export function CreateOutsourcingOrderForm() {
  const navigate = useNavigate({ from: "/manage/outsourcing-orders/create" })
  const queryClient = useQueryClient()
  const createOutsourcingOrderFn = useServerFn(createOutsourcingOrder)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateOutsourcingOrderSchema>(
      "qlsx:draft:create-outsourcing-order-v3"
    )
  const draftRestoredRef = useRef(false)

  const [tab, setTab] = useState<CreateOutsourcingOrderWizardTab>("picker")
  const [createdCode, setCreatedCode] = useState<string | null>(null)

  const { mutate: create, isPending } = useMutation({
    mutationFn: async (value: CreateOutsourcingOrderSchema) => {
      const { code } = await createOutsourcingOrderFn({ data: value })

      setCreatedCode(code)
    },
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })
      toast.success("Đã tạo phiếu xuất đi gia công (OS-OUT)")
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

  const items = useField({ form, name: "items" }).state.value

  function handleTabChange(nextTab: CreateOutsourcingOrderWizardTab) {
    setTab(nextTab)
    saveDraft(form.state.values)
  }

  function resetWizard() {
    form.reset()
    restoreFormDraft(form, createOutsourcingOrderFormDefaultValues)
    clearDraft()
    setTab("picker")
    setCreatedCode(null)
  }

  const tabIndex = wizardTabs.findIndex((t) => t.value === tab)
  const prevTab = tabIndex > 0 ? wizardTabs[tabIndex - 1] : undefined
  const nextTab =
    tabIndex < wizardTabs.length - 1 ? wizardTabs[tabIndex + 1] : undefined

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
      >
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <form.Subscribe
            selector={(state) => ({
              hasItems: state.values.items.length > 0,
              hasTabTwoInfo: Boolean(
                state.values.supplierId &&
                state.values.warehouseId &&
                state.values.sendDate &&
                state.values.expectedReturnDate
              ),
            })}
          >
            {({ hasItems, hasTabTwoInfo }) => (
              <CreateOutsourcingOrderTabs
                tab={tab}
                canGoToItems={hasItems}
                canGoToConfirm={hasItems && hasTabTwoInfo}
                onTabChange={handleTabChange}
              />
            )}
          </form.Subscribe>

          {tab === "picker" && (
            <CreateOutsourcingOrderPickerSection
              form={form}
              disabled={isPending}
            />
          )}
          {tab === "items" && (
            <>
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
            </>
          )}
          {tab === "confirm" && (
            <CreateOutsourcingOrderConfirmSection form={form} />
          )}

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
                    state.values.supplierId &&
                    state.values.warehouseId &&
                    state.values.sendDate &&
                    state.values.expectedReturnDate
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
                    onClick={() => form.handleSubmit()}
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

      {createdCode && (
        <CreateOutsourcingOrderSuccessDialog
          open
          code={createdCode}
          {...sumOutsourcingOrderItemTotals(items)}
          onBackToList={() =>
            void navigate({
              to: "/manage/outsourcing-orders",
              search: { page: 1, limit: 10 },
            })
          }
          onCreateAnother={resetWizard}
        />
      )}
    </>
  )
}
