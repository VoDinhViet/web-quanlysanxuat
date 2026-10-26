import { CheckCircle2, ClipboardList, PackageOpen } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { WizardStepsTabs } from "@/components/shared/layouts/WizardStepsTabs"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type StandaloneOutsourcingOrderWizardStep = "info" | "items" | "confirm"

type StandaloneOutsourcingOrderStepItem =
  WizardStepNavItem<StandaloneOutsourcingOrderWizardStep> & {
    label: string
    icon: ComponentType<LucideProps>
  }

export const standaloneOutsourcingOrderStepItems: StandaloneOutsourcingOrderStepItem[] =
  [
    {
      value: "info",
      label: "① Thông tin phiếu",
      icon: ClipboardList,
      nextLabel: "Tiếp theo: Hàng gửi gia công",
    },
    {
      value: "items",
      label: "② Hàng gửi gia công",
      icon: PackageOpen,
      prevLabel: "Quay lại",
      nextLabel: "Tiếp theo: Xác nhận",
    },
    {
      value: "confirm",
      label: "③ Xác nhận & lưu",
      icon: CheckCircle2,
      prevLabel: "Quay lại",
    },
  ]

type StandaloneOutsourcingOrderStepsTabsProps = {
  canGoToItems: boolean
  canGoToConfirm: boolean
}

// Chỉ vẽ dải trigger — Tabs root + TabsContent sống ở StandaloneOutsourcingOrderForm.tsx.
export function StandaloneOutsourcingOrderStepsTabs({
  canGoToItems,
  canGoToConfirm,
}: StandaloneOutsourcingOrderStepsTabsProps) {
  return (
    <WizardStepsTabs
      steps={standaloneOutsourcingOrderStepItems.map((item) => ({
        value: item.value,
        label: item.label,
        icon: item.icon,
        disabled:
          (item.value === "items" && !canGoToItems) ||
          (item.value === "confirm" && !canGoToConfirm),
      }))}
    />
  )
}
