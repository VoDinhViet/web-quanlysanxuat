import { useState } from "react"
import { CheckCircle, ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type HelpStep = {
  title: string
  tips: string[]
}

const helpSteps: HelpStep[] = [
  {
    title: "1. Chọn PO cần nhập",
    tips: [
      "Chỉ hiện các PO chưa nhập kho.",
      "Có thể tìm theo mã PO hoặc tên/mã vật tư cần nhập.",
      "Chọn 01 PO cho mỗi phiếu nhập.",
    ],
  },
  {
    title: "2. Xem trước nội dung đơn mua",
    tips: ["Xem chi tiết vật tư và số lượng đặt của PO đã chọn."],
  },
  {
    title: "3. Nhập số lượng & xác nhận",
    tips: [
      "Nhập số lượng nhận cho từng vật tư, có thể bỏ bớt vật tư nếu không nhận.",
      "Tích chọn “Yêu cầu QC (IQC)” nếu cần kiểm tra chất lượng đầu vào.",
      "Lưu nháp: dữ liệu được lưu, có thể chỉnh sửa sau.",
      "Xác nhận: tạo phiếu và chuyển sang Chờ nhập kho hoặc Chờ IQC, tuỳ lựa chọn QC.",
    ],
  },
]

const processingLogic = [
  "Mỗi lần nhập chỉ chọn được 1 PO.",
  "Số lượng nhận lần này không được lớn hơn số lượng đặt.",
  "Không chọn yêu cầu QC → trạng thái sau khi xác nhận là Chờ nhập kho.",
  "Chọn yêu cầu QC → trạng thái sau khi xác nhận là Chờ IQC và tự động tạo phiếu IQC.",
  "Có thể bỏ bớt vật tư khỏi danh sách nhận lần này.",
  "Thông tin phiếu (nguồn nhập, PO/lý do, loại tài sản, kho nhận) được điền tự động từ PO.",
]

// Panel hướng dẫn & quy tắc nghiệp vụ tinh gọn đặt ở dưới cùng của form tạo phiếu nhập từ PO.
export function CreateInventoryReceiptFromPoHelpPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:px-5"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Info className="size-3.5 text-primary" />
          <span>Hướng dẫn & Quy tắc nghiệp vụ nhập kho từ PO</span>
          <span className="text-muted-foreground font-normal">
            ({isOpen ? "Bấm để thu gọn" : "Bấm để xem"})
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border/50 px-4 py-4 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Info className="size-4 text-primary" />
                <span className="text-sm">Hướng dẫn 3 bước thao tác</span>
              </div>
              <ul className="mt-3 space-y-3">
                {helpSteps.map((step) => (
                  <li key={step.title} className="text-xs">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                      {step.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle className="size-4 text-success" />
                <span className="text-sm">Logic xử lý</span>
              </div>
              <ul className="mt-3 space-y-2">
                {processingLogic.map((rule) => (
                  <li key={rule} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-success" />
                    <span className="text-muted-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
