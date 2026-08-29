import { ClipboardList, Factory, ListChecks } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { WizardStepsTabs } from "@/components/shared/layouts/WizardStepsTabs"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type CreateInventoryRequisitionWizardStep = "source" | "items" | "info"

type CreateInventoryRequisitionStepItem =
  WizardStepNavItem<CreateInventoryRequisitionWizardStep> & {
    label: string
    icon: ComponentType<LucideProps>
  }

// 3 bước cố định cho cả 2 nguồn lãnh (LSX/thủ công) — nguồn chọn bằng radio ngay trong bước ①
// (CreateInventoryRequisitionSourceSection.tsx), không còn tách route/số bước theo luồng. Export
// để CreateInventoryRequisitionForm.tsx's handleStepChange tra cứu lại giá trị step từ Radix.
export const createInventoryRequisitionStepItems: CreateInventoryRequisitionStepItem[] =
  [
    {
      value: "source",
      label: "① Nguồn lãnh",
      icon: Factory,
      nextLabel: "Tiếp theo: Chọn vật tư",
    },
    {
      value: "items",
      label: "② Chọn vật tư",
      icon: ListChecks,
      prevLabel: "Quay lại",
      nextLabel: "Tiếp theo: SL & thông tin",
    },
    {
      value: "info",
      label: "③ SL & thông tin",
      icon: ClipboardList,
      prevLabel: "Quay lại",
    },
  ]

type CreateInventoryRequisitionStepsTabsProps = {
  canGoToItems: boolean
  canGoToInfo: boolean
}

// Chỉ vẽ dải trigger — Tabs root (value/onValueChange) + TabsContent panel sống ở
// CreateInventoryRequisitionForm.tsx, cùng cách PurchaseRequestCreateStepsTabs.tsx tách.
export function CreateInventoryRequisitionStepsTabs({
  canGoToItems,
  canGoToInfo,
}: CreateInventoryRequisitionStepsTabsProps) {
  return (
    <WizardStepsTabs
      steps={createInventoryRequisitionStepItems.map((item) => ({
        value: item.value,
        label: item.label,
        icon: item.icon,
        disabled:
          (item.value === "items" && !canGoToItems) ||
          (item.value === "info" && !canGoToInfo),
      }))}
    />
  )
}
