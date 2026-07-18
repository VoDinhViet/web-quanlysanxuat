import type { IconifyIcon } from "@iconify/types"

export enum JobStatus {
  IN_PROGRESS = "IN_PROGRESS",
  WAITING_MATERIAL = "WAITING_MATERIAL",
  WAITING_OUTSOURCE = "WAITING_OUTSOURCE",
  WAITING_QC = "WAITING_QC",
  REWORK = "REWORK",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.IN_PROGRESS]: "Đang SX",
  [JobStatus.WAITING_MATERIAL]: "Chờ vật tư",
  [JobStatus.WAITING_OUTSOURCE]: "Chờ OS",
  [JobStatus.WAITING_QC]: "Chờ QC",
  [JobStatus.REWORK]: "Làm lại",
  [JobStatus.COMPLETED]: "Hoàn thành",
  [JobStatus.CANCELLED]: "Đã hủy",
}

export enum NcrSource {
  IQC = "IQC",
  OQC = "OQC",
  MANUAL = "MANUAL",
}

export const NCR_SOURCE_LABELS: Record<NcrSource, string> = {
  [NcrSource.IQC]: "IQC",
  [NcrSource.OQC]: "OQC",
  [NcrSource.MANUAL]: "Thủ công",
}

export enum NcrStatus {
  REWORK = "REWORK",
  SCRAP = "SCRAP",
  PENDING = "PENDING",
}

export const NCR_STATUS_LABELS: Record<NcrStatus, string> = {
  [NcrStatus.REWORK]: "Làm lại",
  [NcrStatus.SCRAP]: "Loại bỏ",
  [NcrStatus.PENDING]: "Chờ xử lý",
}

export enum DoStatus {
  NOT_EXPORTED = "NOT_EXPORTED",
  PREPARING = "PREPARING",
}

export const DO_STATUS_LABELS: Record<DoStatus, string> = {
  [DoStatus.NOT_EXPORTED]: "Chưa xuất",
  [DoStatus.PREPARING]: "Đang chuẩn bị",
}

export type TrendDirection = "up" | "down"

export type StatCard = {
  label: string
  value: number
  unit: string
  icon: IconifyIcon
  iconClassName: string
  trend: {
    direction?: TrendDirection
    text: string
  } | null
}

export type AlertItem = {
  label: string
  count: number
  icon: IconifyIcon
  /** Tinted background + border for the chip card. */
  cardClassName: string
  /** Text color shared by the icon, count, and label. */
  accentClassName: string
  /** Replaces the "Xem chi tiết →" line when set (e.g. "Trong 3 ngày tới"). */
  subtitle: string | null
}

export type ProductionProgressSlice = {
  label: string
  value: number
  colorVar: string
}

export type OverdueJobRow = {
  jobCode: string
  poCode: string
  dueDate: string
  daysOverdue: number
  status: JobStatus
}

export type LowStockMaterialRow = {
  materialCode: string
  materialName: string
  shortage: number
  unit: string
}

export type OverdueOutsourceRow = {
  osCode: string
  supplierName: string
  operation: string
  dueDate: string
  daysOverdue: number
}

export type OpenNcrRow = {
  ncrCode: string
  source: NcrSource
  type: string
  createdAt: string
  status: NcrStatus
}

export type UpcomingDeliveryRow = {
  doCode: string
  customerName: string
  deliveryDate: string
  status: DoStatus
}

export type InventoryAlertPoint = {
  materialCode: string
  belowMinimum: number
  runningLow: number
}

export type QcRatePoint = {
  date: string
  iqcPassRate: number
  oqcPassRate: number
}

export type NcrByTypeSlice = {
  label: string
  value: number
  colorVar: string
}

export type QuickAction = {
  label: string
  icon: IconifyIcon
  /** Text color shared by the tile's icon and label. */
  accentClassName: string
  /** Tinted background + border for the tile. */
  tileClassName: string
}
