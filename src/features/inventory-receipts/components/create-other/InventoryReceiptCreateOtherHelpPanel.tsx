import { CheckCircle, Info, PackageOpen } from "lucide-react"

type HelpStep = {
  title: string
  tips: string[]
}

const helpSteps: HelpStep[] = [
  {
    title: "1. Nhập thông tin chung",
    tips: [
      "Nhập PO / Lý do đầy đủ và rõ ràng.",
      "Chọn “Yêu cầu QC” nếu vật tư cần kiểm tra chất lượng.",
    ],
  },
  {
    title: "2. Thêm vật tư",
    tips: [
      "Bấm “+ Thêm vật tư” để chọn vật tư cần nhập.",
      "Chỉ chọn vật tư đã có trong danh mục vật tư.",
      "Nhập số lượng thực tế nhận được.",
      "Có thể thêm nhiều vật tư cho 1 phiếu nhập.",
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
  "Mỗi phiếu nhập từ khác phải nhập “PO / Lý do”.",
  "Không cho lưu nếu chưa có ít nhất 1 dòng vật tư.",
  "Số lượng nhập được phép là số dương (> 0).",
]

const usageExamples = [
  {
    title: "Điều chỉnh kiểm kê",
    description: "Nhập thực tế sau kiểm kê",
    reason: "PO / Lý do: “Điều chỉnh kiểm kê tháng 06/2026”",
  },
  {
    title: "Trả vật tư dư",
    description: "Trả lại vật tư dư sau khi huỷ lệnh sản xuất",
    reason: "PO / Lý do: “Trả vật tư dư LSX260021”",
  },
  {
    title: "Thu hồi vật tư",
    description: "Thu hồi từ xưởng về kho",
    reason: "PO / Lý do: “Thu hồi vật tư Xưởng Cơ khí”",
  },
  {
    title: "Nhập khác",
    description: "Hàng mẫu, hàng khuyến mãi, vật tư khác...",
    reason: "PO / Lý do: “Hàng mẫu”",
  },
]

// Sidebar tĩnh cạnh form — thuần nội dung hướng dẫn, không đọc form state. Khuôn
// InventoryReceiptCreateFromPoHelpPanel.tsx, thêm block "Ví dụ sử dụng" theo mockup (4 tình huống
// dùng "Nhập từ khác": điều chỉnh kiểm kê, trả vật tư dư, thu hồi vật tư, nhập khác).
export function InventoryReceiptCreateOtherHelpPanel() {
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

      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <PackageOpen className="size-4 text-primary" />
          <span>Ví dụ sử dụng</span>
        </div>
        <ul className="mt-3 space-y-3">
          {usageExamples.map((example) => (
            <li key={example.title} className="text-xs">
              <p className="font-medium text-foreground">{example.title}</p>
              <p className="text-muted-foreground">{example.description}</p>
              <p className="mt-0.5 text-muted-foreground/80 italic">
                {example.reason}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
