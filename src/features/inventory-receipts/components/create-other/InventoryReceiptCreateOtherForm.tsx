import { useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { InventoryReceiptCreateGenericItemsSection } from "@/features/inventory-receipts/components/create/InventoryReceiptCreateGenericItemsSection"
import { InventoryReceiptCreateOtherConfirmSection } from "@/features/inventory-receipts/components/create-other/InventoryReceiptCreateOtherConfirmSection"
import { InventoryReceiptCreateOtherHeaderSection } from "@/features/inventory-receipts/components/create-other/InventoryReceiptCreateOtherHeaderSection"
import { InventoryReceiptCreateOtherHelpPanel } from "@/features/inventory-receipts/components/create-other/InventoryReceiptCreateOtherHelpPanel"
import {
  InventoryReceiptCreateOtherStepsTabs,
  stepItems,
} from "@/features/inventory-receipts/components/create-other/InventoryReceiptCreateOtherStepsTabs"
import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import { postInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/post-inventory-receipt.api"
import {
  createInventoryReceiptOtherFormDefaultValues,
  createInventoryReceiptOtherSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt-other.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { getStepNav } from "@/lib/wizard-steps"
import type { InventoryReceiptOtherWizardStep } from "@/features/inventory-receipts/components/create-other/InventoryReceiptCreateOtherStepsTabs"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

type SubmitAction = "draft" | "confirm" | "post"

type InventoryReceiptCreateOtherFormProps = {
  // Kho RM ("Kho nguyên vật liệu") — InventoryReceiptCreateReceiptPage.tsx đã prefetch qua route
  // loader, chỉ đúng 1 kho loại này. Không có picker nào cho field này (xem
  // InventoryReceiptCreateOtherHeaderSection.tsx), cùng khuôn CreateInventoryRequisitionForm.tsx's
  // warehouseId prop.
  warehouseId: string
}

// Vỏ wizard "Khác" — 3 bước, cùng khuôn InventoryReceiptCreateFromPoForm.tsx (4 bước) nhưng bỏ
// 2 bước "chọn PO"/"xem trước PO" — làn này không có PO nào để chọn/suy dữ liệu từ đó, "note"
// (PO / Lý do, bước ①) đóng vai trò tương đương "đã chọn PO" của wizard kia để mở khoá bước ②.
// Không useFormDraft — cùng lý do CreateFromJobForm.tsx không dùng: một bản nháp cũ gây phiền hơn
// giúp cho luồng ngắn thế này.
//
// 3 hành động cuối form đều đi qua createInventoryReceipt trước (backend luôn tạo DRAFT), rồi tuỳ
// nút bấm gọi tiếp confirm/post — actionRef giữ hành động vừa bấm (đọc lại trong mutationFn/
// onSuccess/onError, tránh stale closure, cùng khuôn InventoryReceiptCreateFromPoForm.tsx):
//   - "Lưu nháp (Draft)"                              → create                    → DRAFT
//   - "Xác nhận (Chờ IQC)" (radio = Yêu cầu QC)        → create → confirm          → PENDING_IQC
//   - "Xác nhận & Nhập kho (Không qua IQC)"            → create → confirm → post   → POSTED
export function InventoryReceiptCreateOtherForm({
  warehouseId,
}: InventoryReceiptCreateOtherFormProps) {
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

  const defaultValues: CreateInventoryReceiptSchema = {
    ...createInventoryReceiptOtherFormDefaultValues,
    warehouseId,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createInventoryReceiptOtherSchema,
    },
    onSubmit: ({ value }) => submit(value),
  })

  const [step, setStep] = useState<InventoryReceiptOtherWizardStep>("info")

  const requiresIqc = useField({ form, name: "requiresIqc" }).state.value

  function handleStepValueChange(value: string) {
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
          <form.Subscribe
            selector={(state) => ({
              hasInfo:
                Boolean(state.values.receiptDate) && Boolean(state.values.note),
              hasItems: state.values.items.length > 0,
            })}
          >
            {({ hasInfo, hasItems }) => (
              <InventoryReceiptCreateOtherStepsTabs
                canGoToItems={hasInfo}
                canGoToConfirm={hasInfo && hasItems}
              />
            )}
          </form.Subscribe>

          <TabsContent value="info" className="m-0 outline-none">
            <InventoryReceiptCreateOtherHeaderSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="items" className="m-0 outline-none">
            <InventoryReceiptCreateGenericItemsSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="confirm" className="m-0 outline-none">
            <InventoryReceiptCreateOtherConfirmSection
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
              Hủy
            </Button>
          )}

          {nextStep ? (
            <form.Subscribe
              selector={(state) => ({
                hasInfo:
                  Boolean(state.values.receiptDate) &&
                  Boolean(state.values.note),
                hasItems: state.values.items.length > 0,
              })}
            >
              {({ hasInfo, hasItems }) => {
                const canAdvance = step === "info" ? hasInfo : hasItems

                return (
                  <Button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => setStep(nextStep)}
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

      <InventoryReceiptCreateOtherHelpPanel />
    </form>
  )
}
