import { Calculator, ClipboardList, ListChecks, Package } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { WizardStepsTabs } from "@/components/shared/layouts/WizardStepsTabs"
import type { WizardStepNavItem } from "@/lib/wizard-steps"

export type UpdateOrderWizardStep =
  | "info"
  | "selectItems"
  | "itemQuantities"
  | "confirm"

type UpdateOrderStepItem = WizardStepNavItem<UpdateOrderWizardStep> & {
  label: string
  icon: ComponentType<LucideProps>
}

// 4 bước cố định, cùng id/nhãn/icon với CreateOrderStepsTabs.tsx. Export để UpdateOrderForm.tsx's
// handleStepChange tra cứu lại giá trị step từ RAC, và để stepFields (cùng file) tra field nào
// thuộc bước nào khi validate/nhảy bước.
export const updateOrderStepItems: UpdateOrderStepItem[] = [
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

// Khác CreateOrderStepsTabs.tsx: không nhận prop `reachedStep` — đơn đang sửa đã tồn tại thật và
// hợp lệ sẵn trên server (không như 1 form Tạo rỗng phải đi tuần tự), nên không có khái niệm
// "bước chưa tới" để khoá. Mọi tab mở sẵn ngay từ khi mở trang.
export function UpdateOrderStepsTabs() {
  return (
    <WizardStepsTabs
      steps={updateOrderStepItems.map((item) => ({
        value: item.value,
        label: item.label,
        icon: item.icon,
      }))}
    />
  )
}
