import { ClockCircle } from "@solar-icons/react"

// Job PENDING: BOM/vật tư/công đoạn là snapshot chụp từ sản phẩm lúc tạo Job hoặc lần tải lại gần nhất.
export function ProductionJobPlanNotice() {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2.5 rounded-md bg-warning/10 px-3 py-2 text-xs">
        <ClockCircle className="size-4 shrink-0 text-warning" />
        <p className="min-w-0 text-muted-foreground">
          <span className="font-semibold text-foreground">
            Kế hoạch chưa xác nhận.
          </span>{" "}
          Dữ liệu lấy từ sản phẩm lúc tạo Job; thay đổi ở sản phẩm không ảnh
          hưởng Job — bấm “Tải lại từ sản phẩm” để cập nhật.
        </p>
      </div>
    </div>
  )
}
