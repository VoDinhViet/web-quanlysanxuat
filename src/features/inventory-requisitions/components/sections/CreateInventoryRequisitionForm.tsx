import { useEffect, useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { Key } from "react-aria-components"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateInventoryRequisitionInfoSection } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionInfoSection"
import { CreateInventoryRequisitionItemsSection } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionItemsSection"
import { CreateInventoryRequisitionPickerSection } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionPickerSection"
import { CreateInventoryRequisitionSourceSection } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionSourceSection"
import {
  CreateInventoryRequisitionStepsTabs,
  createInventoryRequisitionStepItems,
} from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionStepsTabs"
import { createInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/create-inventory-requisition.api"
import {
  createInventoryRequisitionFormDefaultValues,
  createInventoryRequisitionSchema,
} from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { productionJobQueryOptions } from "@/features/production-jobs/api"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { getStepNav } from "@/lib/wizard-steps"
import type { CreateInventoryRequisitionWizardStep } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionStepsTabs"
import type { CreateInventoryRequisitionSchema } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"

// Vỏ wizard "Lãnh vật tư" — 1 route/form duy nhất cho cả 2 nguồn lãnh, chọn bằng radio ở bước ①
// (CreateInventoryRequisitionSourceSection.tsx, field `type`). Không dùng useFormDraft
// (localStorage) như inventory-receipts' wizard — phiếu đã ở DRAFT thật trên server ngay khi tạo,
// một "nháp" cục bộ song song sẽ gây nhầm lẫn, không phải giúp ích.
export function CreateInventoryRequisitionForm() {
  const navigate = useNavigate({
    from: "/manage/inventory-requisitions/create",
  })
  const queryClient = useQueryClient()
  const createInventoryRequisitionFn = useServerFn(createInventoryRequisition)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateInventoryRequisitionSchema) =>
      createInventoryRequisitionFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory-requisitions"],
      })
      toast.success("Đã tạo phiếu lãnh vật tư")
      await navigate({
        to: "/manage/inventory-requisitions",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createInventoryRequisitionFormDefaultValues,
    validators: {
      onSubmit: createInventoryRequisitionSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  const [step, setStep] =
    useState<CreateInventoryRequisitionWizardStep>("source")

  const type = useField({ form, name: "type" }).state.value
  const isJobFlow = type === InventoryRequisitionType.PRODUCTION
  const productionJobId = useField({ form, name: "productionJobId" }).state
    .value
  const items = useField({ form, name: "items" }).state.value

  // Đổi nguồn lãnh hoặc Job thì xoá sạch dòng đã chọn — "6 số" trong snapshot mỗi dòng được tính
  // theo đúng nguồn/Job lúc chọn, giữ dòng cũ là submit số đã hỏng. Đổi sang thủ công thì xoá luôn
  // `productionJobId` để payload không mang Job cũ theo. Ref-guard để không reset ngay lần render
  // đầu.
  const prevSourceRef = useRef({ type, productionJobId })
  useEffect(() => {
    const prev = prevSourceRef.current
    prevSourceRef.current = { type, productionJobId }
    if (prev.type === type && prev.productionJobId === productionJobId) return
    form.setFieldValue("items", [])
    if (type !== InventoryRequisitionType.PRODUCTION) {
      form.setFieldValue("productionJobId", "")
    }
  }, [type, productionJobId, form])

  // Backend không tự suy ra LSX từ Job — cột "PO / Lý do" ở danh sách/chi tiết đọc thẳng
  // productionOrderId nên phải tự điền ngay khi chọn Job (appliedJobIdRef bên dưới).
  const jobQuery = useQuery({
    ...productionJobQueryOptions(productionJobId),
    enabled: isJobFlow && Boolean(productionJobId),
  })
  const appliedJobIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!productionJobId) {
      appliedJobIdRef.current = null
      form.setFieldValue("productionOrderId", "")
      return
    }
    const job = jobQuery.data
    if (!job || appliedJobIdRef.current === job.id) return
    appliedJobIdRef.current = job.id
    form.setFieldValue("productionOrderId", job.productionOrderId)
  }, [productionJobId, jobQuery.data, form])

  const canGoToItems = !isJobFlow || Boolean(productionJobId)
  const canGoToInfo = items.length > 0

  const canAdvance = step === "source" ? canGoToItems : canGoToInfo

  // RAC's onSelectionChange returns a `Key` (string | number); `find` narrows it back
  // without a cast.
  function handleStepChange(key: Key) {
    const nextStep = createInventoryRequisitionStepItems.find(
      (item) => item.value === String(key)
    )
    if (nextStep) setStep(nextStep.value)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createInventoryRequisitionStepItems,
    step
  )

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
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      <Tabs
        selectedKey={step}
        onSelectionChange={handleStepChange}
        className="gap-0"
      >
        <CreateInventoryRequisitionStepsTabs
          canGoToItems={canGoToItems}
          canGoToInfo={canGoToInfo}
        />

        <TabsContent id="source" className="m-0 outline-none">
          <CreateInventoryRequisitionSourceSection
            form={form}
            disabled={isPending}
          />
        </TabsContent>
        <TabsContent id="items" className="m-0 outline-none">
          <CreateInventoryRequisitionPickerSection
            form={form}
            disabled={isPending}
          />
        </TabsContent>
        <TabsContent id="info" className="m-0 outline-none">
          <CreateInventoryRequisitionInfoSection
            form={form}
            disabled={isPending}
          />
          <CreateInventoryRequisitionItemsSection
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
            <ArrowLeft className="size-4" />
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
                to: "/manage/inventory-requisitions",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
        )}

        {nextStep ? (
          <Button
            type="button"
            isDisabled={!canAdvance}
            onPress={() => setStep(nextStep)}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                isDisabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Tạo phiếu lãnh
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        )}
      </div>
    </form>
  )
}
