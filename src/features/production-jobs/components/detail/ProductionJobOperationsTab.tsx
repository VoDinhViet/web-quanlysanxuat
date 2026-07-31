import { Info, Maximize2, Minimize2, Route } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductionJobOperationsSidebar } from "@/features/production-jobs/components/detail/ProductionJobOperationsSidebar"
import { ProductionJobOperationsTable } from "@/features/production-jobs/components/detail/ProductionJobOperationsTable"
import type { ProductionJobMockDetail } from "@/lib/types/production-job.type"

type ProductionJobOperationsTabProps = {
  detail: ProductionJobMockDetail
}

// The mockup's main tab: 1 bảng gộp (nội bộ + gia công ngoài, phân biệt bằng cột "Loại" — xem
// ProductionJobOperationsTable.tsx) bên trái, một sidebar giải thích bên phải. "Thu gọn/Mở rộng
// tất cả" và ô SL hoàn thành của từng dòng đều disabled/readOnly — chưa cắm state thu gọn hay
// mutation cập nhật (task 8.2 là UI-only).
export function ProductionJobOperationsTab({
  detail,
}: ProductionJobOperationsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-md border border-border/60 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
              <Route className="size-3.5 text-muted-foreground" />
              Công đoạn sản xuất
            </h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="gap-1.5 text-xs"
                aria-label="Thu gọn tất cả — chưa được kết nối"
              >
                <Minimize2 className="size-3.5" />
                Thu gọn tất cả
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="gap-1.5 text-xs"
                aria-label="Mở rộng tất cả — chưa được kết nối"
              >
                <Maximize2 className="size-3.5" />
                Mở rộng tất cả
              </Button>
            </div>
          </div>

          <ProductionJobOperationsTable
            parts={detail.inhouseParts}
            outsourceRows={detail.outsourceRows}
          />
        </div>

        <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary">
          <Info className="size-4 shrink-0" />
          Nhấn vào số lượng để cập nhật. Nhấn Enter để lưu nhanh.
        </div>
      </div>

      <ProductionJobOperationsSidebar />
    </div>
  )
}
