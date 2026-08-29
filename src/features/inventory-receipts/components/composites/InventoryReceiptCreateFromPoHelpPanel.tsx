import { CheckCircle, Info } from "lucide-react"

type HelpStep = {
  title: string
  tips: string[]
}

const helpSteps: HelpStep[] = [
  {
    title: "1. Chọn PO cần nhập",
    tips: ["Chỉ hiện các PO chưa nhập kho.", "Chọn 01 PO cho mỗi phiếu nhập."],
  },
  {
    title: "2. Xem trước nội dung đơn mua",
    tips: ["Xem chi tiết vật tư và số lượng đặt của PO đã chọn."],
  },
  {
    title: "3. Nhập số lượng và chọn yêu cầu QC",
    tips: [
      "Nhập số lượng nhận cho từng vật tư.",
      "Có thể bỏ bớt vật tư nếu không nhận.",
      "Tích chọn “Yêu cầu QC (IQC)” nếu cần kiểm tra chất lượng đầu vào.",
    ],
  },
  {
    title: "4. Lưu nháp hoặc xác nhận",
    tips: [
      "Lưu nháp: dữ liệu được lưu, có thể chỉnh sửa sau.",
      "Xác nhận: tạo phiếu và chuyển sang Chờ nhập kho hoặc Chờ IQC, tuỳ lựa chọn ở bước 3.",
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

// Sidebar tĩnh cạnh wizard — thuần nội dung hướng dẫn, không đọc form state. Tách khỏi
// InventoryReceiptCreateFromPoConfirmSection.tsx's "Ý nghĩa trạng thái" (cái đó giải thích trạng
// thái phiếu, còn đây giải thích cách thao tác 4 bước + quy tắc nghiệp vụ).
export function InventoryReceiptCreateFromPoHelpPanel() {
  return (
    <div className="space-y-4 rounded-lg bg-card p-4 shadow-card sm:p-5">
      <div>
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="size-4 text-primary" />
          <span>Hướng dẫn</span>
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

      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <CheckCircle className="size-4 text-success" />
          <span>Logic xử lý</span>
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
  )
}
