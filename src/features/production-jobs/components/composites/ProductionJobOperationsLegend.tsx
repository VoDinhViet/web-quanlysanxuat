import { Diskette } from "@solar-icons/react"
import {
  Download,
  Info,
  Lightbulb,
  Logs,
  MousePointerClick,
  Send,
} from "lucide-react"
import type { ComponentType } from "react"

import {
  operationProgressStatusDescriptions,
  operationProgressStatusStyles,
} from "@/features/production-jobs/components/composites/ProductionJobOperationsTable"
import type { OperationProgressStatus } from "@/features/production-jobs/components/composites/ProductionJobOperationsTable"
import { cn } from "@/lib/utils"

const statuses = Object.keys(
  operationProgressStatusStyles
) as OperationProgressStatus[]

type ActionRow = {
  // Loose enough to cover both lucide's LucideIcon and Solar's icon component — the two libraries
  // don't share an exported prop type, and `className` is all this list actually uses.
  icon: ComponentType<{ className?: string }>
  label: string
  description: string
}

// "Cập nhật SL hoàn thành" dùng Diskette (Solar) — icon y hệt nút Lưu thật trong ô SL hoàn thành,
// không phải toolbar. 3 dòng còn lại dùng đúng icon lucide 3 nút toolbar đang khoá
// (ProductionJobOperationsTab.tsx) — icon ở đây phải khớp icon thật để người dùng đối chiếu được.
const actions: ActionRow[] = [
  {
    icon: Diskette,
    label: "Cập nhật SL hoàn thành",
    description:
      "Gõ số vào ô SL hoàn thành trong bảng rồi bấm nút Lưu (hoặc Enter) để lưu ngay dòng đó.",
  },
  {
    icon: Logs,
    label: "Xem lịch sử cập nhật",
    description:
      "Xem lại các lần sửa SL hoàn thành trước đó. Chưa được xây dựng.",
  },
  {
    icon: Send,
    label: "Gửi đi gia công ngoài",
    description:
      "Ghi nhận số lượng đã gửi cho công đoạn gia công ngoài. Chưa được xây dựng.",
  },
  {
    icon: Download,
    label: "Cập nhật SL nhận về (gia công ngoài)",
    description:
      "Ghi nhận số lượng đã nhận về từ gia công ngoài. Chưa được xây dựng.",
  },
]

// Chú thích cho tab "Công đoạn sản xuất" — nằm full-width dưới bảng (ProductionJobOperationsTab.tsx),
// 3 cột ngang trên màn lớn, xếp chồng dọc trên mobile — đúng khuôn card tĩnh
// InventoryIssuesLegend.tsx/InventoryRequisitionsLegend.tsx (không Collapsible — không Legend nào trong
// repo thu gọn được), chỉ đổi 2 cột thành 3. Mục 1 lấy thẳng
// operationProgressStatusStyles/Descriptions từ ProductionJobOperationsTable.tsx nên không thể
// lệch màu/nhãn với badge "Trạng thái" thật. Mục 2 chỉ có 1 chức năng thật (Cập nhật SL hoàn
// thành, dùng đúng nút Diskette đã có) — 3 dòng còn lại là toolbar đang khoá, ghi rõ "chưa được
// xây dựng" đúng chữ DisabledAction đang dùng, không suy diễn ngưỡng gửi/nhận chưa tồn tại trên DTO.
export function ProductionJobOperationsLegend() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-card p-3 text-xs shadow-card sm:p-4 lg:grid-cols-3">
      {/* Giải thích trạng thái */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="size-4 text-primary" />
          <span>Giải thích trạng thái:</span>
        </div>
        <ul className="space-y-2">
          {statuses.map((status) => {
            const { label, dot } = operationProgressStatusStyles[status]
            return (
              <li key={status} className="flex items-start gap-2">
                <span
                  className={cn("mt-1 size-1.5 shrink-0 rounded-full", dot)}
                />
                <span className="text-muted-foreground">
                  <strong className="font-medium text-foreground">
                    {label}:
                  </strong>{" "}
                  {operationProgressStatusDescriptions[status]}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Chức năng thao tác */}
      <div className="space-y-2.5 border-t border-border/60 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <MousePointerClick className="size-4 text-primary" />
          <span>Chức năng thao tác:</span>
        </div>
        <ul className="space-y-2">
          {actions.map((action) => (
            <li key={action.label} className="flex items-start gap-2">
              <action.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                <strong className="font-medium text-foreground">
                  {action.label}:
                </strong>{" "}
                {action.description}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ghi chú */}
      <div className="space-y-2.5 border-t border-border/60 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Lightbulb className="size-4 text-amber-500" />
          <span>Ghi chú:</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <p>
            • SL kế hoạch được lấy từ cấu trúc sản phẩm (BOM) khi LSX được
            duyệt.
          </p>
          <p>
            • SL hoàn thành là số lượng thực tế đã hoàn thành tại xưởng — nhập
            trực tiếp vào bảng.
          </p>
          <p>
            • Ngày hoàn thành tự điền khi SL hoàn thành đạt đủ SL kế hoạch, tự
            xoá nếu sửa lại xuống dưới mức đó.
          </p>
          <p>
            • Theo dõi gửi/nhận gia công ngoài (có thể nhiều lần, tự động cộng
            dồn) sẽ được bổ sung sau.
          </p>
        </div>
      </div>
    </div>
  )
}
