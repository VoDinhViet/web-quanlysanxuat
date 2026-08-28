import { CheckCircle, Info } from "lucide-react"

type HelpStep = {
  title: string
  tips: string[]
}

const helpSteps: HelpStep[] = [
  {
    title: "1. Nhập thông tin chung",
    tips: [
      "Chọn khách hàng cung cấp vật tư.",
      "Chọn “Yêu cầu QC” nếu vật tư cần kiểm tra chất lượng.",
    ],
  },
  {
    title: "2. Thêm vật tư",
    tips: [
      "Bấm “+ Thêm vật tư” để chọn vật tư khách hàng cung cấp.",
      "Chỉ chọn vật tư đã có trong danh mục vật tư.",
      "Nhập số lượng thực tế nhận được.",
    ],
  },
  {
    title: "3. Lưu nháp hoặc xác nhận",
    tips: [
      "Lưu nháp: phiếu ở trạng thái Draft.",
      "Xác nhận (Chờ IQC): chuyển sang bước kiểm tra chất lượng.",
      "Xác nhận & Nhập kho (Không qua IQC): nhập kho trực tiếp.",
    ],
  },
]

const processingLogic = [
  "Lưu phiếu ở trạng thái Draft khi chọn “Lưu nháp”.",
  "Nếu chọn “Xác nhận (Chờ IQC)” → phiếu chuyển sang trạng thái “Chờ IQC”.",
  "Nếu chọn “Xác nhận & Nhập kho (Không qua IQC)” → hệ thống ghi tăng tồn kho ngay.",
  "Vật tư khách hàng cung cấp bị FAIL QC chỉ xử lý được “Chấp nhận có điều kiện” — chưa có phương án trả lại khách.",
  "Không cho lưu nếu chưa có ít nhất 1 dòng vật tư.",
  "Số lượng nhập được phép là số dương (> 0).",
]

// Sidebar tĩnh cạnh form — khuôn InventoryReceiptCreateOtherHelpPanel.tsx (không có "Ví dụ sử
// dụng" — chỉ 1 tình huống, khách hàng cung cấp vật tư, không cần liệt kê ví dụ).
export function InventoryReceiptCreateReturnHelpPanel() {
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
