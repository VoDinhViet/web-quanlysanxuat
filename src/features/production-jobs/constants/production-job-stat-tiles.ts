import {
  CheckCircle,
  ClipboardList,
  ClockCircle,
  Delivery,
  Settings,
  ShieldCheck,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import {
  ProductionJobStatus,
  productionJobStatusLabels,
} from "@/lib/types/production-job.type"
import type { ProductionJobStats } from "@/lib/types/production-job.type"

type ProductionJobStatTile = {
  label: string
  // undefined → the "Tổng Job" tile, which clears the status filter.
  status: ProductionJobStatus | undefined
  icon: ComponentType<IconProps>
  iconClassName: string
  statKey: keyof ProductionJobStats
}

// Tones follow ProductionJobStatusBadge so a tile and the rows it filters read as one status.
export const productionJobStatTiles: ProductionJobStatTile[] = [
  {
    label: "Tổng Job",
    status: undefined,
    icon: ClipboardList,
    iconClassName: "bg-primary/15 text-primary",
    statKey: "total",
  },
  {
    label: productionJobStatusLabels[ProductionJobStatus.PENDING],
    status: ProductionJobStatus.PENDING,
    icon: ClockCircle,
    iconClassName: "bg-muted text-muted-foreground",
    statKey: "pending",
  },
  {
    label: productionJobStatusLabels[ProductionJobStatus.IN_PROGRESS],
    status: ProductionJobStatus.IN_PROGRESS,
    icon: Settings,
    iconClassName: "bg-info-soft text-info-ink",
    statKey: "inProgress",
  },
  {
    label: productionJobStatusLabels[ProductionJobStatus.WAITING_QC],
    status: ProductionJobStatus.WAITING_QC,
    icon: ShieldCheck,
    iconClassName: "bg-warning-soft text-warning-ink",
    statKey: "waitingQc",
  },
  {
    label: productionJobStatusLabels[ProductionJobStatus.WAITING_DELIVERY],
    status: ProductionJobStatus.WAITING_DELIVERY,
    icon: Delivery,
    iconClassName: "bg-info-soft text-info-ink",
    statKey: "waitingDelivery",
  },
  {
    label: productionJobStatusLabels[ProductionJobStatus.COMPLETED],
    status: ProductionJobStatus.COMPLETED,
    icon: CheckCircle,
    iconClassName: "bg-success-soft text-success-ink",
    statKey: "completed",
  },
]
