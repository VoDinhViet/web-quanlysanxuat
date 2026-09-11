import {
  Info,
  Lightbulb,
  MousePointerClick,
  NotebookPen,
  Send,
} from "lucide-react"
import type { ComponentType } from "react"

import {
  operationProgressStatusDescriptions,
  operationProgressStatusStyles,
} from "@/features/production-execution/components/sections/ProductionExecutionOperationsTable"
import type { OperationProgressStatus } from "@/features/production-execution/components/sections/ProductionExecutionOperationsTable"
import { cn } from "@/lib/utils"

const statuses = Object.keys(
  operationProgressStatusStyles
) as OperationProgressStatus[]

type ActionRow = {
  icon: ComponentType<{ className?: string }>
  label: string
  description: string
}

const actions: ActionRow[] = [
  {
    icon: NotebookPen,
    label: "Nhập báo cáo",
    description:
      'Bấm "Nhập báo cáo" ở cột Thao tác để ghi SL hoàn thành/không đạt của lần này, kèm ngày, ghi chú và ảnh — số được cộng dồn vào SL hiện có.',
  },
  {
    icon: Send,
    label: "Gửi gia công ngoài",
    description:
      'Bấm "Gửi gia công ngoài" với công đoạn gia công ngoài để điều hướng sang màn hình tạo phiếu gửi gia công ngoài (OS-OUT).',
  },
]

export function ProductionExecutionOperationsLegend() {
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
            • SL hoàn thành công đoạn Trong xưởng là số lượng thực tế đã hoàn
            thành tại xưởng — nhập qua nút "Nhập báo cáo" ở cột Thao tác.
          </p>
          <p>
            • SL hoàn thành công đoạn Gia công ngoài tự cập nhật theo SL đã nhận
            về (OS-IN) — không nhập tay được.
          </p>
          <p>
            • Ngày hoàn thành tự điền khi SL hoàn thành đạt đủ SL kế hoạch.
          </p>
        </div>
      </div>
    </div>
  )
}
