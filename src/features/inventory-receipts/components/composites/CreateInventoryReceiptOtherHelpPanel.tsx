import { CheckCircle, Info } from "lucide-react"

type HelpStep = {
  title: string
  tips: string[]
}

const helpSteps: HelpStep[] = [
  {
    title: "1. Nhập thông tin chung",
    tips: ["Nhập “PO / Lý do” (bắt buộc) để truy vết vì sao nhập kho."],
  },
  {
    title: "2. Chọn vật tư",
    tips: [
      "Tích chọn một hoặc nhiều vật tư cần nhập trong danh mục.",
      "Có thể tìm theo tên hoặc mã vật tư, chọn qua nhiều trang.",
    ],
  },
  {
    title: "3. Nhập số lượng & xác nhận",
    tips: [
      "Nhập số lượng thực tế nhận được cho từng vật tư đã chọn.",
      "Lưu nháp: phiếu ở trạng thái Draft.",
      "Xác nhận (Chờ IQC): chuyển sang bước kiểm tra chất lượng.",
      "Xác nhận & Nhập kho (Không qua IQC): nhập kho trực tiếp.",
    ],
  },
]

const processingLogic = [
  "Không dùng cho hàng mua theo PO (dùng làn “Nhập mua hàng”) hay vật tư khách cung cấp (làn “Nhập từ khách hàng”).",
  "Kiểm kê thừa không nhập ở đây — dùng phiếu Điều chỉnh tồn (lý do Kiểm kê).",
  "Phiếu đã nhập kho không huỷ được; muốn đảo thì lập phiếu Điều chỉnh tồn giảm.",
  "Không cho lưu nếu chưa có ít nhất 1 dòng vật tư.",
  "Số lượng nhập được phép là số dương (> 0).",
]

// Sidebar tĩnh cạnh form "Nhập từ khác", cùng khuôn CreateInventoryReceiptReturnHelpPanel.tsx.
export function CreateInventoryReceiptOtherHelpPanel() {
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
