import { Download, Logs, Route, Send } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { ProductionJobBomTable } from "@/features/production-jobs/components/detail/ProductionJobBomTable"
import { productionJobBomQueryOptions } from "@/features/production-jobs/api/options"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobBomItem } from "@/lib/types/production-job.type"

// A rough row-count guess for the loading placeholder's height — the BOM tree isn't paginated,
// so there's no `search.limit` to size it off (unlike the paginated tables elsewhere in the app).
const bomRowEstimate = 5

export type ProductionJobBomRow = {
  node: ProductionJobBomItem
  path: string
  level: number
}

// GET /production-jobs/:jobId/bom returns a flat parent-child list (`parentId` links each node
// to its parent, `null` = top-level, direct child of the FG) — build the tree in memory and
// flatten it back out depth-first into a numbered, indented row list (path like "1.2"), same
// idiom as `flattenNodes` in ProductBomTable.tsx.
function buildBomRows(nodes: ProductionJobBomItem[]): ProductionJobBomRow[] {
  const childrenByParentId = new Map<string | null, ProductionJobBomItem[]>()
  nodes.forEach((node) => {
    const siblings = childrenByParentId.get(node.parentId) ?? []
    siblings.push(node)
    childrenByParentId.set(node.parentId, siblings)
  })

  const rows: ProductionJobBomRow[] = []

  function visit(
    parentId: string | null,
    parentPath: string | null,
    level: number
  ) {
    const children = childrenByParentId.get(parentId) ?? []
    children.forEach((node, index) => {
      const path =
        parentPath === null ? `${index + 1}` : `${parentPath}.${index + 1}`
      rows.push({ node, path, level })
      visit(node.id, path, level + 1)
    })
  }

  visit(null, null, 0)
  return rows
}

// An operation counts as "hoàn thành" once its completedQuantity reaches its own BOM node's
// plannedQuantity — same threshold the backend uses to auto-set completedDate. Feeds the header
// badge; each Part's own count is computed the same way inside ProductionJobBomTable.
function summarizeOperationProgress(rows: ProductionJobBomRow[]): {
  completed: number
  total: number
} {
  let completed = 0
  let total = 0

  rows.forEach((row) => {
    row.node.operations.forEach((operation) => {
      total += 1
      if (operation.completedQuantity >= row.node.plannedQuantity) {
        completed += 1
      }
    })
  })

  return { completed, total }
}

type ProductionJobBomTabProps = {
  productionJobId: string
  status: ProductionJobStatus
}

// Reads GET /production-jobs/:jobId/bom directly (client-driven, tab-gated) and groups its
// as-used routing by BOM node — one header per node (code/tên + SL hoàn thành của riêng node đó)
// followed by that node's công đoạn, mỗi công đoạn kèm SL kế hoạch (plannedQuantity của node) và
// ô SL hoàn thành sửa được (ghi đè qua PATCH .../operations/:operationId). Sửa chỉ mở khi Job
// đang IN_PROGRESS (khớp ràng buộc backend — completedQuantity/completedDate đóng băng ngoài
// trạng thái đó).
//
// Single-column, full width: the previous 320px side rail (`ProductionJobBomSidebar`, since
// removed) only ever held inert placeholders for gửi/nhận gia công ngoài + a static rule list —
// none of it was Job-specific data worth keeping in view the way ProductDetailSidebar's facts
// are, so it's folded into the card itself instead of claiming a permanent column: the pending
// actions move into the header toolbar (DisabledAction — same "chưa được xây dựng" idiom as the
// list page's row actions), the rule text moves to a caption below the table (same idiom as
// ProductionOrderItemsCard's "Công thức: …" line), and the table gets the width back.
export function ProductionJobBomTab({
  productionJobId,
  status,
}: ProductionJobBomTabProps) {
  const bomQuery = useQuery(productionJobBomQueryOptions(productionJobId))
  const canEdit = status === ProductionJobStatus.IN_PROGRESS
  const rows = bomQuery.data ? buildBomRows(bomQuery.data) : []
  const progress = summarizeOperationProgress(rows)

  return (
    <div className="min-w-0 space-y-3 p-4 sm:p-5">
      <div className="overflow-hidden rounded-md border border-border/60 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Route className="size-3.5 text-muted-foreground" />
            <h2 className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Công đoạn sản xuất
            </h2>
            {bomQuery.isSuccess && progress.total > 0 ? (
              <Badge variant="secondary" className="font-normal">
                {progress.completed}/{progress.total} hoàn thành
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            <DisabledAction
              label="Xem lịch sử cập nhật"
              hint="chưa được xây dựng"
            >
              <Logs className="size-3.5" />
            </DisabledAction>
            <DisabledAction
              label="Gửi đi gia công ngoài"
              hint="chưa được xây dựng"
            >
              <Send className="size-3.5" />
            </DisabledAction>
            <DisabledAction
              label="Cập nhật SL nhận về (gia công ngoài)"
              hint="chưa được xây dựng"
            >
              <Download className="size-3.5" />
            </DisabledAction>
          </div>
        </div>

        {bomQuery.isPending ? (
          <TableQueryLoading rows={bomRowEstimate} />
        ) : bomQuery.isError ? (
          <TableQueryError
            error={bomQuery.error.message}
            onRetry={() => void bomQuery.refetch()}
          />
        ) : (
          <ProductionJobBomTable
            rows={rows}
            productionJobId={productionJobId}
            canEdit={canEdit}
          />
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        SL kế hoạch lấy từ cấu trúc sản phẩm lúc tạo Job. SL hoàn thành là số
        lượng thực tế đã hoàn thành tại xưởng — nhập trực tiếp vào bảng trên,
        Ngày hoàn thành tự điền khi đạt đủ SL kế hoạch. Theo dõi gửi/nhận gia
        công ngoài (có thể nhiều lần, tự động cộng dồn) sẽ được bổ sung sau.
      </p>
    </div>
  )
}
