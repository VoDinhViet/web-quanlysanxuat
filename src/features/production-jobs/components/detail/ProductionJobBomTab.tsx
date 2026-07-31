import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductionJobProgressBar } from "@/features/production-jobs/components/detail/ProductionJobProgressBar"
import { ProductionStepStatusBadge } from "@/features/production-jobs/components/detail/ProductionJobStepBadges"
import { resolveProductionStepStatus } from "@/lib/types/production-job.type"
import type { ProductionJobMockMaterial } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionJobBomTabProps = {
  materials: ProductionJobMockMaterial[]
}

// "BOM vật tư" tab — vật tư cần cho Job này. "SL cần"/"Đã xuất"/"Còn lại" dồn vào một cột "Tiến
// độ xuất kho" duy nhất (badge + phân số + thanh tiến độ) thay vì 3 cột số rời — người đứng máy
// cần biết "đã đủ vật tư chưa", không cần tự trừ 3 con số. Badge/trạng thái dùng chung
// resolveProductionStepStatus + ProductionStepStatusBadge với tab "Công đoạn sản xuất": xuất kho
// đủ = DONE, đang xuất dở = IN_PROGRESS, chưa xuất = NOT_STARTED — cùng một ngữ nghĩa "đã làm
// bao nhiêu trên kế hoạch", không phải state ngẫu nhiên trùng tên. Read-only, chưa nối nghiệp vụ
// xuất kho (task 8.2).
export function ProductionJobBomTab({ materials }: ProductionJobBomTabProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
          <TableHead className="w-14 font-bold text-foreground">STT</TableHead>
          <TableHead className="w-32 font-bold text-foreground">
            Mã vật tư
          </TableHead>
          <TableHead className="min-w-44 font-bold text-foreground">
            Tên vật tư
          </TableHead>
          <TableHead className="w-24 font-bold text-foreground">ĐVT</TableHead>
          <TableHead className="w-24 text-center font-bold text-foreground">
            Định mức
          </TableHead>
          <TableHead className="min-w-48 font-bold text-foreground">
            Tiến độ xuất kho
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material, index) => (
          <TableRow key={material.id} className="bg-card hover:bg-muted/20">
            <TableCell className="py-3 font-mono text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="py-3 font-mono font-semibold text-foreground">
              {material.code}
            </TableCell>
            <TableCell className="py-3 font-medium text-foreground">
              {material.name}
            </TableCell>
            <TableCell className="py-3 text-muted-foreground">
              {material.unitName}
            </TableCell>
            <TableCell className="py-3 text-center text-foreground tabular-nums">
              {quantityFormatter.format(material.normQty)}
            </TableCell>
            <TableCell className="py-3">
              <IssueProgress material={material} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function IssueProgress({ material }: { material: ProductionJobMockMaterial }) {
  const status = resolveProductionStepStatus(
    material.requiredQty,
    material.issuedQty
  )
  const percent =
    material.requiredQty > 0
      ? Math.min(
          100,
          Math.round((material.issuedQty / material.requiredQty) * 100)
        )
      : 0

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <ProductionStepStatusBadge status={status} />
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {quantityFormatter.format(material.issuedQty)}/
          {quantityFormatter.format(material.requiredQty)} {material.unitName}
        </span>
      </div>
      <ProductionJobProgressBar percent={percent} />
    </div>
  )
}
