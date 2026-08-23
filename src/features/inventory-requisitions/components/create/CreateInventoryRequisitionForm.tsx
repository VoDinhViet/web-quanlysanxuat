import { useEffect, useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateInventoryRequisitionInfoSection } from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionInfoSection"
import { CreateInventoryRequisitionItemsSection } from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionItemsSection"
import { CreateInventoryRequisitionPickerSection } from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionPickerSection"
import { CreateInventoryRequisitionSourceSection } from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionSourceSection"
import {
  CreateInventoryRequisitionStepsTabs,
  createInventoryRequisitionStepItems,
} from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionStepsTabs"
import { createInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/create-inventory-requisition.api"
import {
  createInventoryRequisitionFormDefaultValues,
  createInventoryRequisitionSchema,
} from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { productionJobQueryOptions } from "@/features/production-jobs/api"
import { useAppForm } from "@/hooks/use-app-form"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import type { CreateInventoryRequisitionWizardStep } from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionStepsTabs"
import type { CreateInventoryRequisitionSchema } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"

type CreateInventoryRequisitionFormProps = {
  // Kho RM ("Kho nguyên vật liệu") — route loader đã prefetch, Page đọc qua useSuspenseQuery rồi
  // truyền thẳng xuống đây làm defaultValues.warehouseId. Không có picker nào cho field này (chỉ
  // có đúng 1 kho loại RM), nên field cố định ngay từ lúc mount, không cần tự fetch+set qua effect.
  warehouseId: string
}

// Vỏ wizard "Lãnh vật tư" — 1 route/form duy nhất cho cả 2 nguồn lãnh, chọn bằng radio ở bước ①
// (CreateInventoryRequisitionSourceSection.tsx, field `type`). Không dùng useFormDraft
// (localStorage) như inventory-receipts' wizard — phiếu đã ở DRAFT thật trên server ngay khi tạo,
// một "nháp" cục bộ song song sẽ gây nhầm lẫn, không phải giúp ích.
export function CreateInventoryRequisitionForm({
  warehouseId,
}: CreateInventoryRequisitionFormProps) {
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

  const defaultValues: CreateInventoryRequisitionSchema = {
    ...createInventoryRequisitionFormDefaultValues,
    warehouseId,
  }

  const form = useAppForm({
    defaultValues,
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
  // `productionJobId` để payload không mang Job cũ theo. `warehouseId` không cần theo dõi ở đây:
  // nó là defaultValues cố định từ prop (route loader đã resolve trước khi form mount). Ref-guard
  // để không reset ngay lần render đầu.
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
  // productionOrderId nên phải tự điền ngay khi chọn Job, cùng idiom appliedJobIdRef của
  // InventoryReceiptCreateFromJobForm.tsx.
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

  const canGoToItems =
    Boolean(warehouseId) && (!isJobFlow || Boolean(productionJobId))
  const canGoToInfo = items.length > 0

  // Nút "Tiếp theo" chỉ render khi step !== "info" (nhánh else của submit-vs-next bên dưới), nên
  // ở đây step chỉ còn "source" hoặc "items" — gộp disabled/target/label vào một chỗ thay vì 3
  // ternary `step === "source"` rải rác.
  const nextStepConfig =
    step === "source"
      ? {
          disabled: !canGoToItems,
          target: "items" as const,
          label: "Tiếp theo: Chọn vật tư",
        }
      : {
          disabled: !canGoToInfo,
          target: "info" as const,
          label: "Tiếp theo: SL & thông tin",
        }

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast.
  function handleStepChange(value: string) {
    const nextStep = createInventoryRequisitionStepItems.find(
      (item) => item.value === value
    )
    if (nextStep) setStep(nextStep.value)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      <Tabs value={step} onValueChange={handleStepChange} className="gap-0">
        <CreateInventoryRequisitionStepsTabs
          canGoToItems={canGoToItems}
          canGoToInfo={canGoToInfo}
        />

        <TabsContent value="source" className="m-0 outline-none">
          <CreateInventoryRequisitionSourceSection
            form={form}
            disabled={isPending}
          />
        </TabsContent>
        <TabsContent value="items" className="m-0 outline-none">
          <CreateInventoryRequisitionPickerSection
            form={form}
            disabled={isPending}
          />
        </TabsContent>
        <TabsContent value="info" className="m-0 outline-none">
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
        {step === "source" ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/inventory-requisitions",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() => setStep(step === "info" ? "items" : "source")}
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </Button>
        )}

        {step === "info" ? (
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
                    <Save className="size-4" />
                    Tạo phiếu lãnh
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        ) : (
          <Button
            type="button"
            disabled={nextStepConfig.disabled}
            onClick={() => setStep(nextStepConfig.target)}
          >
            {nextStepConfig.label}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
