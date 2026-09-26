import { ClockCircle } from "@solar-icons/react"

// Job PENDING: BOM/vật tư/công đoạn tính sống theo sản phẩm hiện tại × SL Job, chưa đóng băng.
export function ProductionJobPlanNotice() {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2.5 rounded-md bg-warning/10 px-3 py-2 text-xs">
        <ClockCircle className="size-4 shrink-0 text-warning" />
        <p className="min-w-0 text-muted-foreground">
          <span className="font-semibold text-foreground">
            Kế hoạch tạm tính · Chưa xác nhận.
          </span>{" "}
          Số liệu tự cập nhật khi sản phẩm thay đổi; bấm “Xác nhận kế hoạch” để
          chốt.
        </p>
      </div>
    </div>
  )
}
