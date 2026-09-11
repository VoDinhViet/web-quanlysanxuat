import { useEffect, useRef, useState } from "react"
import { revalidateLogic, useField } from "@tanstack/react-form"
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
import type { Key } from "react-aria-components"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { InventoryReceiptCreateFromPoConfirmSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoConfirmSection"
import { InventoryReceiptCreateFromPoHelpPanel } from "@/features/inventory-receipts/components/composites/InventoryReceiptCreateFromPoHelpPanel"
import { InventoryReceiptCreateFromPoItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoItemsSection"
import { InventoryReceiptCreateFromPoPickerSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoPickerSection"
import { InventoryReceiptCreateFromPoPreviewSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoPreviewSection"
import {
  InventoryReceiptCreateFromPoStepsTabs,
  stepItems,
} from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoStepsTabs"
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
import { getStepNav } from "@/lib/wizard-steps"
import type { InventoryReceiptFromPoWizardStep } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoStepsTabs"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type {
  CreateInventoryReceiptFromPoFormSchema,
  InventoryReceiptFromPoItemValue,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

// Ghép giá trị wizard-local (UI-only field) + PO đã fetch thành đúng payload
// CreateInventoryReceiptSchema mà createInventoryReceipt server function cần — không có ô nhập
// tay nào cho supplierId/receiptDate/unitPrice trong 4 bước, tất cả tự suy ra từ PO.
function buildCreateInventoryReceiptPayload(
  value: CreateInventoryReceiptFromPoFormSchema,
  purchaseOrder: PurchaseOrderDetail,
  receiptDate: string
): CreateInventoryReceiptSchema {
  return {
    code: "",
    receiptType: InventoryReceiptType.PURCHASE,
    assetType: value.assetType,
    receiptDate,
    supplierId: purchaseOrder.supplier.id,
    clientId: "",
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
    from: "/manage/inventory-receipts/create-receipt",
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
      if (!purchaseOrder) {
        throw new Error("Chưa chọn đơn mua hàng — vui lòng chọn PO khác.")
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
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createInventoryReceiptFromPoFormSchema,
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

  const { data: purchaseOrder, isFetching: isPoFetching } = useQuery({
    ...purchaseOrderQueryOptions(purchaseOrderId),
    enabled: Boolean(purchaseOrderId),
  })

  // Tự động seed items ở cấp form ngay khi PO được fetch, không phụ thuộc vào việc tab nào đang mount.
  // Tránh race condition khi người dùng chuyển bước nhanh dẫn đến items bị rỗng ("không có vật tư").
  const seededForPoRef = useRef<string | null>(null)
  useEffect(() => {
    if (!purchaseOrder) return
    if (seededForPoRef.current === purchaseOrder.id) return

    // Nếu vừa khôi phục draft thành công cho chính PO này và đã có items, không ghi đè giá trị draft
    if (
      draftRestoredRef.current &&
      form.state.values.purchaseOrderId === purchaseOrder.id &&
      form.state.values.items.length > 0
    ) {
      seededForPoRef.current = purchaseOrder.id
      return
    }

    seededForPoRef.current = purchaseOrder.id

    const items: InventoryReceiptFromPoItemValue[] = purchaseOrder.items
      .map((line) => {
        const received = line.receivedQuantity
        const remaining = Math.max(line.quantity - received, 0)
        return {
          purchaseOrderItemId: line.id,
          itemId: line.purchaseRequestItem.item.id,
          itemLabel: `${line.purchaseRequestItem.item.code} — ${line.purchaseRequestItem.item.name}`,
          itemUnit: line.purchaseRequestItem.item.unit.name,
          requestedQuantity: line.quantity,
          remainingQuantity: remaining,
          quantity: remaining,
          note: "",
        }
      })
      .filter((item) => item.remainingQuantity > 0)

    form.setFieldValue("items", items)
  }, [purchaseOrder, form])

  function handleStepChange(nextStep: InventoryReceiptFromPoWizardStep) {
    setStep(nextStep)
    saveDraft(form.state.values)
  }

  // RAC's onSelectionChange returns a `Key` (string | number); `find` narrows it back
  // without a cast, and an unrecognised value simply doesn't switch steps. Delegates to the
  // typed `handleStepChange` above so the draft-on-step-change behavior stays in one place.
  function handleStepValueChange(key: Key) {
    const nextStep = stepItems.find((item) => item.value === String(key))

    if (nextStep) {
      handleStepChange(nextStep.value)
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
              hasPurchaseOrder: Boolean(state.values.purchaseOrderId),
              hasItems: state.values.items.length > 0,
            })}
          >
            {({ hasPurchaseOrder, hasItems }) => (
              <InventoryReceiptCreateFromPoStepsTabs
                canGoToPreview={hasPurchaseOrder}
                canGoToItems={hasPurchaseOrder && hasItems}
                canGoToConfirm={hasItems}
              />
            )}
          </form.Subscribe>

          <TabsContent value="po" keepMounted className="m-0 outline-none">
            <InventoryReceiptCreateFromPoPickerSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="preview" keepMounted className="m-0 outline-none">
            <InventoryReceiptCreateFromPoPreviewSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="items" keepMounted className="m-0 outline-none">
            <InventoryReceiptCreateFromPoItemsSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="confirm" keepMounted className="m-0 outline-none">
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
                      ? hasPurchaseOrder && hasItems && !isPoFetching
                      : hasItems

                return (
                  <Button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => handleStepChange(nextStep)}
                  >
                    {isPoFetching && step === "preview" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang tải vật tư…
                      </>
                    ) : (
                      <>
                        {nextLabel}
                        <AltArrowRight className="size-4" />
                      </>
                    )}
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
