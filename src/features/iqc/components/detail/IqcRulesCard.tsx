import { DangerTriangle } from "@solar-icons/react"

import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"

const rules = [
  "Bảng AQL chỉ mang tính tham khảo — QC tự chọn PASS/FAIL, không bị chặn bởi cỡ mẫu/Ac/Re tra được.",
  "Kết quả PASS thì không được chọn phương án xử lý — chọn lại PASS sẽ xoá mọi lựa chọn xử lý đã nhập trước đó.",
  "Chọn Phân loại thì SL OK + SL NG phải bằng đúng Tổng SL của phiếu.",
  "Chọn Phân loại/Trả NCC và lưu sẽ tự sinh phiếu trả NCC (nháp) — sau đó không sửa lại được kết quả IQC nữa.",
  "Phiếu nhập kho chỉ được nhập kho (post) sau khi mọi phiếu IQC liên quan đã Hoàn thành.",
]

// QUY TẮC QUAN TRỌNG — tĩnh, không đọc dữ liệu.
export function IqcRulesCard() {
  return (
    <IqcDetailSectionCard
      icon={DangerTriangle}
      title="Quy tắc quan trọng"
      description="Cần biết trước khi lưu kết quả QC"
    >
      <ul className="space-y-3">
        {rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2.5 text-xs">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              !
            </span>
            <span className="text-muted-foreground">{rule}</span>
          </li>
        ))}
      </ul>
    </IqcDetailSectionCard>
  )
}
