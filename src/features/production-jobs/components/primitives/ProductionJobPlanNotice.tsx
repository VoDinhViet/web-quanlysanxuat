import { InfoCircle } from "@solar-icons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Job PENDING: BOM/vật tư/công đoạn tính sống theo sản phẩm hiện tại × SL Job, chưa đóng băng.
export function ProductionJobPlanNotice() {
  return (
    <div className="px-4 pt-4 sm:px-5">
      <Alert className="border-info/30 bg-info/5">
        <InfoCircle />
        <AlertTitle>Kế hoạch tạm tính — chưa xác nhận</AlertTitle>
        <AlertDescription>
          Số liệu tính theo cấu trúc sản phẩm hiện tại × số lượng Job và tự cập
          nhật khi sản phẩm thay đổi. Bấm “Xác nhận kế hoạch” để chốt.
        </AlertDescription>
      </Alert>
    </div>
  )
}
