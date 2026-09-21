import { Calculator, ClipboardList, Package } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { WizardStepsTabs } from "@/components/shared/layouts/WizardStepsTabs"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type CreateOrderWizardStep = "info" | "selectItems" | "confirm"

type CreateOrderStepItem = WizardStepNavItem<CreateOrderWizardStep> & {
  label: string
  icon: ComponentType<LucideProps>
}

// 3 bước cố định — bước "confirm" gộp cả số lượng/giá theo dòng và phần xác nhận/tổng tiền cũ
// (2 bước riêng trước đây) vào cùng 1 màn, xem CreateOrderForm.tsx. Export để
// CreateOrderForm.tsx's handleStepChange tra cứu lại giá trị step từ RAC.
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
    nextLabel: "Tiếp theo: Số lượng, giá & xác nhận",
  },
  {
    value: "confirm",
    label: "③ Số lượng, giá & xác nhận",
    icon: Calculator,
    prevLabel: "Quay lại",
  },
]

type CreateOrderStepsTabsProps = {
  // Cùng điều kiện đóng nút "Tiếp theo" của bước ① — không có form.trigger() ở TanStack Form nên
  // gate bằng 1 boolean đơn giản, đúng khuôn CreateInventoryRequisitionStepsTabs.tsx. "selectItems"
  // và "confirm" dùng chung điều kiện này: không có yêu cầu riêng để rời "selectItems" (đơn hàng
  // có thể chưa chọn sản phẩm), nên bước ③ không cần gate nào khác ngoài bước ① đã hợp lệ.
  canGoToSelectItems: boolean
}

// Chỉ vẽ dải trigger — Tabs root (selectedKey/onSelectionChange) + TabsContent panel sống ở
// CreateOrderForm.tsx, cùng cách CreateInventoryRequisitionStepsTabs.tsx tách.
export function CreateOrderStepsTabs({
  canGoToSelectItems,
}: CreateOrderStepsTabsProps) {
  return (
    <WizardStepsTabs
      steps={createOrderStepItems.map((item) => ({
        value: item.value,
        label: item.label,
        icon: item.icon,
        disabled: item.value !== "info" && !canGoToSelectItems,
      }))}
    />
  )
}
