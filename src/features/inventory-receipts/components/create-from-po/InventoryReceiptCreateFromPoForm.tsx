import { useEffect, useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
  Diskette,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { DateTime } from "luxon"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { InventoryReceiptCreateFromPoConfirmSection } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoConfirmSection"
import { InventoryReceiptCreateFromPoHelpPanel } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoHelpPanel"
import { InventoryReceiptCreateFromPoItemsSection } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoItemsSection"
import { InventoryReceiptCreateFromPoPickerSection } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoPickerSection"
import { InventoryReceiptCreateFromPoPreviewSection } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoPreviewSection"
import {
  InventoryReceiptCreateFromPoStepsTabs,
  stepItems,
} from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoStepsTabs"
import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import {
  createInventoryReceiptFromPoFormDefaultValues,
  createInventoryReceiptFromPoFormSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { InventoryReceiptType } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptFromPoWizardStep } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoStepsTabs"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { CreateInventoryReceiptFromPoFormSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type StepNavMeta = {
  prevStep?: InventoryReceiptFromPoWizardStep
  prevLabel?: string
  nextStep?: InventoryReceiptFromPoWizardStep
  nextLabel?: string
}

const stepNav: Record<InventoryReceiptFromPoWizardStep, StepNavMeta> = {
  po: { nextStep: "preview", nextLabel: "Tiếp theo: Xem trước đơn mua" },
  preview: {
    prevStep: "po",
    prevLabel: "Quay lại chọn PO",
    nextStep: "items",
    nextLabel: "Tiếp theo: Nhập SL & QC",
  },
  items: {
    prevStep: "preview",
    prevLabel: "Quay lại xem trước đơn mua",
    nextStep: "confirm",
    nextLabel: "Tiếp theo: Xác nhận",
  },
  confirm: { prevStep: "items", prevLabel: "Quay lại nhập SL & QC" },
}

// Ghép giá trị wizard-local (UI-only field) + PO đã fetch thành đúng payload
// CreateInventoryReceiptSchema mà createInventoryReceipt server function cần — không có ô nhập
// tay nào cho warehouseId/supplierId/receiptDate/unitPrice trong 4 bước, tất cả tự suy ra từ PO.
function buildCreateInventoryReceiptPayload(
  value: CreateInventoryReceiptFromPoFormSchema,
  purchaseOrder: PurchaseOrderDetail,
  receiptDate: string
): CreateInventoryReceiptSchema {
  return {
    code: "",
    warehouseId: purchaseOrder.receiptWarehouse?.id ?? "",
    receiptType: InventoryReceiptType.PURCHASE,
    receiptDate,
    supplierId: purchaseOrder.supplier.id,
    purchaseRequestId: "",
    productionOrderId: "",
    productionJobId: "",
    purchaseOrderId: value.purchaseOrderId,
    requiresIqc: value.requiresIqc === "yes",
    note: "",
    items: value.items.map((item) => {
      const poLine = purchaseOrder.items.find(
        (line) => line.id === item.purchaseOrderItemId
      )

      return {
        itemId: item.itemId,
        itemLabel: item.itemLabel,
        itemUnit: item.itemUnit,
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantity: item.quantity,
        unitPrice: poLine?.unitPrice ?? undefined,
        note: item.note,
      }
    }),
  }
}

// Vỏ wizard "Nhập kho từ PO" — rập khuôn CreateQuotationForm.tsx, 4 bước thay vì 2. Khác với RFQ:
// "Lưu nháp" và "Xác nhận" ở đây đều là hành động server thật (backend luôn tạo DRAFT ở POST
// /inventory-receipts, "Xác nhận" gọi thêm confirm để chuyển DRAFT → PENDING_RECEIPT/PENDING_IQC)
// — không phải lưu cục bộ như RFQ. `useFormDraft` (localStorage) tách riêng, chỉ để khôi phục nếu
// người dùng refresh giữa chừng, tự lưu mỗi lần đổi bước qua `handleStepChange`.
export function InventoryReceiptCreateFromPoForm() {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-from-po",
  })
  const queryClient = useQueryClient()
  const createReceiptFn = useServerFn(createInventoryReceipt)
  const confirmReceiptFn = useServerFn(confirmInventoryReceipt)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateInventoryReceiptFromPoFormSchema>(
      "qlsx:draft:create-inventory-receipt-from-po-v2"
    )
  const draftRestoredRef = useRef(false)
  // "Lưu nháp" và "Xác nhận" đều đi qua form.handleSubmit() (cùng cần validate) — ref giữ hành
  // động nào vừa được bấm, đọc lại trong mutationFn/onSuccess. Dùng ref thay vì useState vì
  // mutationFn được đóng gói lúc useMutation dựng lên, đọc state ở đó sẽ bị stale closure; ref thì
  // luôn đọc giá trị mới nhất tại thời điểm gọi.
  const shouldConfirmRef = useRef(false)

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async (value: CreateInventoryReceiptFromPoFormSchema) => {
      if (!purchaseOrder?.receiptWarehouse) {
        throw new Error("PO chưa khai báo kho nhận — vui lòng chọn PO khác.")
      }

      const receiptDate = DateTime.now().toFormat("yyyy-MM-dd")
      const payload = buildCreateInventoryReceiptPayload(
        value,
        purchaseOrder,
        receiptDate
      )
      const { id } = await createReceiptFn({ data: payload })

      if (shouldConfirmRef.current) {
        await confirmReceiptFn({ data: { receiptId: id } })
      }
    },
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({
        queryKey: ["inventory-receipts"],
      })
      toast.success(
        shouldConfirmRef.current
          ? "Đã tạo và xác nhận phiếu nhập kho"
          : "Đã lưu nháp phiếu nhập kho"
      )
      await navigate({
        to: "/manage/inventory-receipts",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createInventoryReceiptFromPoFormDefaultValues,
    validators: {
      onSubmit: createInventoryReceiptFromPoFormSchema,
    },
    onSubmit: ({ value }) => submit(value),
  })

  const [step, setStep] = useState<InventoryReceiptFromPoWizardStep>("po")

  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
    .value

  const { data: purchaseOrder } = useQuery({
    ...purchaseOrderQueryOptions(purchaseOrderId),
    enabled: Boolean(purchaseOrderId),
  })

  function handleStepChange(nextStep: InventoryReceiptFromPoWizardStep) {
    setStep(nextStep)
    saveDraft(form.state.values)
  }

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast, and an
  // unrecognised value simply doesn't switch steps. Delegates to the typed `handleStepChange`
  // above so the draft-on-step-change behavior stays in one place.
  function handleStepValueChange(value: string) {
    const nextStep = stepItems.find((item) => item.value === value)

    if (nextStep) {
      handleStepChange(nextStep.value)
    }
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = stepNav[step]

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
              hasPurchaseOrder: Boolean(state.values.purchaseOrderId),
              hasItems: state.values.items.length > 0,
            })}
          >
            {({ hasPurchaseOrder, hasItems }) => (
              <InventoryReceiptCreateFromPoStepsTabs
                canGoToPreview={hasPurchaseOrder}
                canGoToItems={
                  hasPurchaseOrder && Boolean(purchaseOrder?.receiptWarehouse)
                }
                canGoToConfirm={hasItems}
              />
            )}
          </form.Subscribe>

          <TabsContent value="po" className="m-0 outline-none">
            <InventoryReceiptCreateFromPoPickerSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="preview" className="m-0 outline-none">
            <InventoryReceiptCreateFromPoPreviewSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="items" className="m-0 outline-none">
            <InventoryReceiptCreateFromPoItemsSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="confirm" className="m-0 outline-none">
            <InventoryReceiptCreateFromPoConfirmSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          {prevStep ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => handleStepChange(prevStep)}
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
                hasPurchaseOrder: Boolean(state.values.purchaseOrderId),
                hasItems: state.values.items.length > 0,
              })}
            >
              {({ hasPurchaseOrder, hasItems }) => {
                const canAdvance =
                  step === "po"
                    ? hasPurchaseOrder
                    : step === "preview"
                      ? hasPurchaseOrder &&
                        Boolean(purchaseOrder?.receiptWarehouse)
                      : hasItems

                return (
                  <Button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => handleStepChange(nextStep)}
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
                  shouldConfirmRef.current = false
                  if (form.state.isSubmitting) return
                  form.handleSubmit()
                }}
              >
                <Diskette className="size-4" />
                Lưu nháp
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                  requiresIqc: state.values.requiresIqc,
                })}
              >
                {({ canSubmit, isSubmitting, requiresIqc }) => (
                  <Button
                    type="button"
                    disabled={!canSubmit || isSubmitting || isPending}
                    onClick={() => {
                      shouldConfirmRef.current = true
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
                        {requiresIqc === "yes"
                          ? "Xác nhận & Gửi IQC"
                          : "Xác nhận (Chờ nhập kho)"}
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          )}
        </div>
      </div>

      <InventoryReceiptCreateFromPoHelpPanel />
    </form>
  )
}
