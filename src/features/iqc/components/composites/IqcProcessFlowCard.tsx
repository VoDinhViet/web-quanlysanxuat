import { Route } from "@solar-icons/react"

import { IqcDetailSectionCard } from "@/features/iqc/components/layouts/IqcDetailSectionCard"
import { cn } from "@/lib/utils"

type FlowNodeProps = {
  label: string
  note?: string
  dot: string
  indent?: 0 | 1 | 2
}

function FlowNode({ label, note, dot, indent = 0 }: FlowNodeProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-2",
        indent === 1 && "ml-4 border-l-2 border-dashed border-border pl-3",
        indent === 2 && "ml-7 border-l-2 border-dashed border-border pl-3"
      )}
    >
      <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", dot)} />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{label}</p>
        {note ? <p className="text-muted-foreground">{note}</p> : null}
      </div>
    </li>
  )
}

// LUỒNG XỬ LÝ — sơ đồ tĩnh của state machine thật (resolveIqcStatus ở backend), không đọc dữ
// liệu gì. Xếp dọc một cột (không chia 2 cột PASS/FAIL cạnh nhau) vì cột sidebar chỉ rộng
// ~300px — chia đôi sẽ làm nhãn/ghi chú bị bẻ dòng chật chội. Khối "LOGIC NGHIỆP VỤ IQC" 5 thẻ
// màu ở cuối ảnh mẫu bị bỏ (theo câu trả lời của user).
export function IqcProcessFlowCard() {
  return (
    <IqcDetailSectionCard
      icon={Route}
      title="Luồng xử lý"
      description="Các bước từ khi tạo phiếu đến khi hoàn thành"
    >
      <ol className="space-y-2.5 text-xs">
        <FlowNode
          label="Chưa kiểm"
          note="Phiếu IQC vừa tạo"
          dot="bg-muted-foreground/60"
        />
        <FlowNode
          label="QC nhập kết quả"
          note="Chọn PASS hoặc FAIL, kèm ghi chú/bằng chứng"
          dot="bg-primary"
        />
        <FlowNode label="PASS → Hoàn thành" dot="bg-success" indent={1} />
        <FlowNode
          label="FAIL → Chờ xử lý"
          note="Chọn phương án xử lý"
          dot="bg-amber-500 dark:bg-amber-400"
          indent={1}
        />
        <FlowNode
          label="Chấp nhận đặc biệt → Hoàn thành"
          dot="bg-success"
          indent={2}
        />
        <FlowNode
          label="Phân loại / Trả NCC → Chờ trả NCC"
          note="Tự sinh phiếu trả NCC"
          dot="bg-blue-500 dark:bg-blue-400"
          indent={2}
        />
        <FlowNode
          label="Kho xuất trả NCC → Hoàn thành"
          note="Trừ tồn, tự hoàn thành IQC"
          dot="bg-success"
          indent={2}
        />
      </ol>
    </IqcDetailSectionCard>
  )
}
