import { useState } from "react"
import { revalidateLogic, useField, useStore } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateInventoryReceiptReturnConfirmSection } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnConfirmSection"
import { CreateInventoryReceiptReturnHeaderSection } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnHeaderSection"
import { CreateInventoryReceiptReturnItemsSection } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnItemsSection"
import { CreateInventoryReceiptReturnPickerSection } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnPickerSection"
import { CreateInventoryReceiptReturnHelpPanel } from "@/features/inventory-receipts/components/composites/CreateInventoryReceiptReturnHelpPanel"
import {
  CreateInventoryReceiptReturnStepsTabs,
  stepItems,
} from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnStepsTabs"
import {
  createInventoryReceiptReturnFormDefaultValues,
  createInventoryReceiptReturnSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt-return.schema"
import { useSubmitInventoryReceipt } from "@/features/inventory-receipts/hooks/use-submit-inventory-receipt"
import { useAppForm } from "@/hooks/use-app-form"
import { getStepNav } from "@/lib/wizard-steps"
import type { InventoryReceiptReturnWizardStep } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnStepsTabs"

// Vỏ wizard "Khách hàng" — 3 bước: Thông tin chung → Chọn vật tư (checkbox picker, lọc theo
// clientId đã chọn) → Nhập số lượng & Xác nhận. Khác `CreateInventoryReceiptFromPoForm.tsx` ở
// header section (combobox khách hàng thay "Nguồn nhập"/"PO / Lý do") và schema (bắt buộc
// clientId — mở khoá bước ② thay "note" của làn "Khác").
export function CreateInventoryReceiptReturnForm() {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })
  const { submit, isPending, actionRef } = useSubmitInventoryReceipt()

  const form = useAppForm({
    defaultValues: createInventoryReceiptReturnFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createInventoryReceiptReturnSchema,
    },
    onSubmit: ({ value }) => submit(value),
  })

  const [step, setStep] = useState<InventoryReceiptReturnWizardStep>("info")

  const requiresIqc = useField({ form, name: "requiresIqc" }).state.value
  const hasInfo = useStore(
    form.store,
    (state) =>
      Boolean(state.values.receiptDate) &&
      Boolean(state.values.clientId) &&
      Boolean(state.values.reason.trim())
  )
  const hasItems = useStore(
    form.store,
    (state) => state.values.items.length > 0
  )

  function handleStepValueChange(value: unknown) {
    const nextStep = stepItems.find((item) => item.value === value)

    if (nextStep) {
      setStep(nextStep.value)
    }
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    stepItems,
    step
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <Tabs
          value={step}
          onValueChange={handleStepValueChange}
          className="gap-0"
        >
          <CreateInventoryReceiptReturnStepsTabs
            canGoToPicker={hasInfo}
            canGoToItems={hasInfo && hasItems}
          />

          <TabsContent value="info" className="m-0 outline-none">
            <CreateInventoryReceiptReturnHeaderSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="picker" className="m-0 outline-none">
            <CreateInventoryReceiptReturnPickerSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="items" className="m-0 outline-none">
            <CreateInventoryReceiptReturnItemsSection
              form={form}
              disabled={isPending}
            />
            <CreateInventoryReceiptReturnConfirmSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          {prevStep ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => setStep(prevStep)}
            >
              <AltArrowLeft className="size-4" />
              {prevLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() =>
                void navigate({
                  to: "/manage/inventory-receipts",
                  search: { page: 1, limit: 10 },
                })
              }
            >
              Thoát
            </Button>
          )}

          {nextStep ? (
            <Button
              type="button"
              disabled={!(step === "info" ? hasInfo : hasItems)}
              onClick={() => setStep(nextStep)}
            >
              {nextLabel}
              <AltArrowRight className="size-4" />
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  actionRef.current = "draft"
                  if (form.state.isSubmitting) return
                  form.handleSubmit()
                }}
              >
                <Save className="size-4" />
                Lưu nháp (Draft)
              </Button>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="button"
                    disabled={!canSubmit || isSubmitting || isPending}
                    onClick={() => {
                      actionRef.current = requiresIqc ? "confirm" : "post"
                      if (form.state.isSubmitting) return
                      form.handleSubmit()
                    }}
                  >
                    {isSubmitting || isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Đang xử lý
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4" />
                        {requiresIqc
                          ? "Xác nhận (Chờ IQC)"
                          : "Xác nhận & Nhập kho (Không qua IQC)"}
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          )}
        </div>
      </div>

      <CreateInventoryReceiptReturnHelpPanel />
    </form>
  )
}
