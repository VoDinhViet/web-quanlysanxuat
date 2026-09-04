import { Calculator, ClipboardList, ListChecks, Package } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { WizardStepsTabs } from "@/components/shared/layouts/WizardStepsTabs"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type CreateOrderWizardStep =
  | "info"
  | "selectItems"
  | "itemQuantities"
  | "confirm"

type CreateOrderStepItem = WizardStepNavItem<CreateOrderWizardStep> & {
  label: string
  icon: ComponentType<LucideProps>
}

const createOrderStepOrder: CreateOrderWizardStep[] = [
  "info",
  "selectItems",
  "itemQuantities",
  "confirm",
]

// 4 bước cố định. Export để CreateOrderForm.tsx's handleStepChange tra cứu lại giá trị step từ
// RAC, và để stepFields (cùng file) tra field nào thuộc bước nào khi validate/nhảy bước.
export const createOrderStepItems: CreateOrderStepItem[] = [
  {
    value: "info",
    label: "① Thông tin chung",
    icon: ClipboardList,
    nextLabel: "Tiếp theo: Chọn sản phẩm",
  },
  {
    value: "selectItems",
    label: "② Chọn sản phẩm",
    icon: Package,
    prevLabel: "Quay lại",
    nextLabel: "Tiếp theo: Số lượng & giá",
  },
  {
    value: "itemQuantities",
    label: "③ Số lượng & giá",
    icon: ListChecks,
    prevLabel: "Quay lại",
    nextLabel: "Tiếp theo: Xác nhận",
  },
  {
    value: "confirm",
    label: "④ Xác nhận & tổng tiền",
    icon: Calculator,
    prevLabel: "Quay lại",
  },
]

type CreateOrderStepsTabsProps = {
  // Bước xa nhất đã validate qua được — mọi bước sau nó bị khoá trên tab strip, chặn bấm tab
  // nhảy cóc qua bước chưa qua form.trigger(). Xem CreateOrderForm.tsx's `furthestStep`.
  reachedStep: CreateOrderWizardStep
}

// Chỉ vẽ dải trigger — Tabs root (selectedKey/onSelectionChange) + TabsContent panel sống ở
// CreateOrderForm.tsx, cùng cách CreateInventoryRequisitionStepsTabs.tsx tách.
export function CreateOrderStepsTabs({
  reachedStep,
}: CreateOrderStepsTabsProps) {
  const reachedIndex = createOrderStepOrder.indexOf(reachedStep)

  return (
    <WizardStepsTabs
      steps={createOrderStepItems.map((item, index) => ({
        value: item.value,
        label: item.label,
        icon: item.icon,
        disabled: index > reachedIndex,
      }))}
    />
  )
}
