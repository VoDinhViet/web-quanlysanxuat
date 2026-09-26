import { useSearch } from "@tanstack/react-router"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/button"
import { resolveFileUrl } from "@/lib/file-url"
import {
  ProductionJobStatus,
  productionJobStatusLabels,
  productionOperationEvaluationLabels,
  productionOperationProgressStatusLabels,
} from "@/lib/types/production-job.type"
import type { FileResource } from "@/lib/types/file.type"
import type {
  ProductionOperationEvaluation,
  ProductionOperationProgressStatus,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

type ProductionExecutionImageCellProps = {
  image: FileResource | null
  fit?: "cover" | "contain"
  className?: string
}

export function ProductionExecutionImageCell({
  image,
  fit = "cover",
  className,
}: ProductionExecutionImageCellProps) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40",
        className
      )}
    >
      {image ? (
        <Image
          src={resolveFileUrl(image.url)}
          alt="Ảnh sản phẩm"
          layout="fullWidth"
          objectFit={fit}
          className="size-full"
        />
      ) : (
        <Gallery className="size-4 text-muted-foreground/50" />
      )}
    </div>
  )
}

const statusBadgeClassNames: Record<ProductionOperationProgressStatus, string> =
  {
    OVERDUE: "bg-destructive/10 text-destructive",
    NOT_STARTED: "bg-muted text-muted-foreground",
    IN_PROGRESS: "bg-info/10 text-info",
    DONE: "bg-success/10 text-success",
  }

export function ProductionExecutionJobStatusBadge({
  status,
}: {
  status: ProductionOperationProgressStatus
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent whitespace-nowrap",
        statusBadgeClassNames[status]
      )}
    >
      {productionOperationProgressStatusLabels[status]}
    </Badge>
  )
}

const evaluationBadgeClassNames: Record<ProductionOperationEvaluation, string> =
  {
    ON_TIME: "bg-success/10 text-success",
    LATE: "bg-destructive/10 text-destructive",
  }

export function ProductionExecutionEvaluationBadge({
  evaluation,
}: {
  evaluation: ProductionOperationEvaluation | null
}) {
  if (evaluation === null) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent whitespace-nowrap",
        evaluationBadgeClassNames[evaluation]
      )}
    >
      {productionOperationEvaluationLabels[evaluation]}
    </Badge>
  )
}

type ProductionExecutionJobActionsCellProps = {
  productionJobId: string
}

// Đọc `operationId` qua useSearch (route search hiện tại của chính trang danh sách) thay vì nhận
// qua prop cột — giữ `productionExecutionJobColumns` ở module scope (forms-and-ui.md: columns
// không được tạo lại mỗi render), cùng idiom OperationSendActionCell.tsx đọc `productionJobId` qua
// useParams. Trang chi tiết cần đúng operationId này để BE lọc bảng Part
// (GET .../operations?operationId=...).
export function ProductionExecutionJobActionsCell({
  productionJobId,
}: ProductionExecutionJobActionsCellProps) {
  const { operationId } = useSearch({
    from: "/(authed)/manage_/production-execution/",
  })

  return (
    <LinkButton
      to="/manage/production-execution/$productionJobId"
      params={{ productionJobId }}
      search={{ operationId }}
      size="sm"
      className="text-xs"
    >
      Xem chi tiết
      <ArrowRight className="size-3.5" />
    </LinkButton>
  )
}

const lifecycleBadgeClassNames: Record<ProductionJobStatus, string> = {
  [ProductionJobStatus.PENDING]: "bg-muted text-muted-foreground",
  [ProductionJobStatus.IN_PROGRESS]: "bg-success/10 text-success",
  [ProductionJobStatus.WAITING_QC]: "bg-info/10 text-info",
  [ProductionJobStatus.WAITING_DELIVERY]: "bg-info/10 text-info",
  [ProductionJobStatus.COMPLETED]: "bg-success/10 text-success",
}

// Trạng thái vòng đời của cả Job (PENDING → … → COMPLETED) — khác badge "Trạng thái" phía trên là
// tiến độ của MỘT công đoạn trên Job.
export function ProductionExecutionJobLifecycleBadge({
  status,
}: {
  status: ProductionJobStatus
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent px-3 py-1 text-xs whitespace-nowrap",
        lifecycleBadgeClassNames[status]
      )}
    >
      {productionJobStatusLabels[status]}
    </Badge>
  )
}
