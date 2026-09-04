import { useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { Key } from "react-aria-components"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { InventoryReceiptCreateGenericItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateGenericItemsSection"
import { InventoryReceiptCreateReturnConfirmSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateReturnConfirmSection"
import { InventoryReceiptCreateReturnHeaderSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateReturnHeaderSection"
import { InventoryReceiptCreateReturnHelpPanel } from "@/features/inventory-receipts/components/composites/InventoryReceiptCreateReturnHelpPanel"
import {
  InventoryReceiptCreateReturnStepsTabs,
  stepItems,
} from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateReturnStepsTabs"
import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import { postInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/post-inventory-receipt.api"
import {
  createInventoryReceiptReturnFormDefaultValues,
  createInventoryReceiptReturnSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt-return.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { getStepNav } from "@/lib/wizard-steps"
import type { InventoryReceiptReturnWizardStep } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateReturnStepsTabs"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

type SubmitAction = "draft" | "confirm" | "post"

// Vỏ wizard "Khách hàng" — 3 bước. Khác `InventoryReceiptCreateFromPoForm.tsx` ở header section
// (combobox khách hàng thay "Nguồn nhập"/"PO / Lý do") và schema (bắt buộc clientId, note
// tuỳ chọn — "clientId" đóng vai trò mở khoá bước ② thay "note" của làn "Khác").
//
// 3 hành động cuối form đều đi qua createInventoryReceipt trước (backend luôn tạo DRAFT), rồi tuỳ
// nút bấm gọi tiếp confirm/post — actionRef giữ hành động vừa bấm, cùng khuôn
// InventoryReceiptCreateFromPoForm.tsx:
//   - "Lưu nháp (Draft)"                              → create                    → DRAFT
//   - "Xác nhận (Chờ IQC)" (radio = Yêu cầu QC)        → create → confirm          → PENDING_IQC
//   - "Xác nhận & Nhập kho (Không qua IQC)"            → create → confirm → post   → POSTED
export function InventoryReceiptCreateReturnForm() {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })
  const queryClient = useQueryClient()
  const createReceiptFn = useServerFn(createInventoryReceipt)
  const confirmReceiptFn = useServerFn(confirmInventoryReceipt)
  const postReceiptFn = useServerFn(postInventoryReceipt)

  const actionRef = useRef<SubmitAction>("draft")
  // Set ngay sau khi `create` thành công — đọc lại ở `onError` để phân biệt "create thất bại" (báo
  // lỗi bình thường) với "create xong nhưng confirm/post thất bại" (phiếu đã tồn tại ở trạng thái
  // dở, không thể im lặng như một lỗi thường).
  const createdReceiptIdRef = useRef<string | null>(null)

  const invalidateAndGoToList = async () => {
    await queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })
    await navigate({
      to: "/manage/inventory-receipts",
      search: { page: 1, limit: 10 },
    })
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async (value: CreateInventoryReceiptSchema) => {
      createdReceiptIdRef.current = null
      const receipt = await createReceiptFn({ data: value })
      createdReceiptIdRef.current = receipt.id

      if (actionRef.current === "draft") return

      await confirmReceiptFn({ data: { receiptId: receipt.id } })

      if (actionRef.current === "post") {
        await postReceiptFn({ data: { receiptId: receipt.id } })
      }
    },
    onSuccess: async () => {
      toast.success(
        actionRef.current === "draft"
          ? "Đã lưu nháp phiếu nhập kho"
          : actionRef.current === "post"
            ? "Đã tạo và nhập kho phiếu nhập kho"
            : "Đã tạo phiếu nhập kho và gửi IQC"
      )
      await invalidateAndGoToList()
    },
    onError: async (error) => {
      if (!createdReceiptIdRef.current) {
        toast.error(error.message)
        return
      }

      toast.error(
        `${error.message} Phiếu đã được tạo, vui lòng hoàn tất ở trang chi tiết.`
      )
      await invalidateAndGoToList()
    },
  })

  const form = useAppForm({
    defaultValues: createInventoryReceiptReturnFormDefaultValues,
    validators: {
      onSubmit: createInventoryReceiptReturnSchema,
    },
    onSubmit: ({ value }) => submit(value),
  })

  const [step, setStep] = useState<InventoryReceiptReturnWizardStep>("info")

  const requiresIqc = useField({ form, name: "requiresIqc" }).state.value

  function handleStepValueChange(key: Key) {
    const nextStep = stepItems.find((item) => item.value === String(key))

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
          selectedKey={step}
          onSelectionChange={handleStepValueChange}
          className="gap-0"
        >
          <form.Subscribe
            selector={(state) => ({
              hasInfo:
                Boolean(state.values.receiptDate) &&
                Boolean(state.values.clientId),
              hasItems: state.values.items.length > 0,
            })}
          >
            {({ hasInfo, hasItems }) => (
              <InventoryReceiptCreateReturnStepsTabs
                canGoToItems={hasInfo}
                canGoToConfirm={hasInfo && hasItems}
              />
            )}
          </form.Subscribe>

          <TabsContent id="info" className="m-0 outline-none">
            <InventoryReceiptCreateReturnHeaderSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent id="items" className="m-0 outline-none">
            <InventoryReceiptCreateGenericItemsSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent id="confirm" className="m-0 outline-none">
            <InventoryReceiptCreateReturnConfirmSection
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
              isDisabled={isPending}
              onPress={() => setStep(prevStep)}
            >
              <AltArrowLeft className="size-4" />
              {prevLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              isDisabled={isPending}
              onPress={() =>
                void navigate({
                  to: "/manage/inventory-receipts",
                  search: { page: 1, limit: 10 },
                })
              }
            >
              Hủy
            </Button>
          )}

          {nextStep ? (
            <form.Subscribe
              selector={(state) => ({
                hasInfo:
                  Boolean(state.values.receiptDate) &&
                  Boolean(state.values.clientId),
                hasItems: state.values.items.length > 0,
              })}
            >
              {({ hasInfo, hasItems }) => {
                const canAdvance = step === "info" ? hasInfo : hasItems

                return (
                  <Button
                    type="button"
                    isDisabled={!canAdvance}
                    onPress={() => setStep(nextStep)}
                  >
                    {nextLabel}
                    <AltArrowRight className="size-4" />
                  </Button>
                )
              }}
            </form.Subscribe>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                isDisabled={isPending}
                onPress={() => {
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
                    isDisabled={!canSubmit || isSubmitting || isPending}
                    onPress={() => {
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

      <InventoryReceiptCreateReturnHelpPanel />
    </form>
  )
}
