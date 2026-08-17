import {
  Bag4,
  BillList,
  Box,
  Buildings2,
  CartLarge2,
  ClipboardAdd,
  ClockCircle,
  DangerTriangle,
  Delivery,
  DocumentAdd,
  DocumentText,
  InboxIn,
  InboxOut,
  Magnifer,
} from "@solar-icons/react"
import { faker } from "@faker-js/faker"

import {
  DoStatus,
  JobStatus,
  NcrSource,
  NcrStatus,
} from "@/lib/types/manage.type"
import type {
  AlertItem,
  InventoryAlertPoint,
  LowStockMaterialRow,
  NcrByTypeSlice,
  OpenNcrRow,
  OverdueJobRow,
  OverdueOutsourceRow,
  ProductionProgressSlice,
  QcRatePoint,
  QuickAction,
  StatCard,
  UpcomingDeliveryRow,
} from "@/lib/types/manage.type"

// Mock data for the Dashboard UI — no backend endpoint exists for these
// widgets yet. Seeded so the layout stays stable across reloads; replace
// with real server-function data once the API exists (see architecture.md).
faker.seed(2026)

const chartColorVars = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

function nextChartColor(index: number): string {
  return chartColorVars[index % chartColorVars.length]
}

function poCode(): string {
  return `PO-2024-${faker.number.int({ min: 1, max: 40 }).toString().padStart(3, "0")}`
}

function jobCode(): string {
  return `JOB-${faker.number.int({ min: 800, max: 899 })}`
}

function recentDateLabel(): string {
  return faker.date.recent({ days: 10 }).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const statCards: StatCard[] = [
  {
    label: "PO đang chạy",
    value: 42,
    unit: "đơn",
    icon: Delivery,
    iconClassName:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    trend: { direction: "up", text: "12% so với tuần trước" },
  },
  {
    label: "PO trễ hạn",
    value: 5,
    unit: "đơn",
    icon: ClockCircle,
    iconClassName: "bg-destructive/15 text-destructive",
    trend: { direction: "up", text: "2 so với hôm qua" },
  },
  {
    label: "PO sắp giao",
    value: 12,
    unit: "đơn",
    icon: Box,
    iconClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    trend: { text: "Trong 3 ngày tới" },
  },
  {
    label: "Job đang sản xuất",
    value: 25,
    unit: "job",
    icon: Buildings2,
    iconClassName: "bg-success/15 text-success",
    trend: { direction: "up", text: "8 so với hôm qua" },
  },
  {
    label: "Chờ QC",
    value: 5,
    unit: "job",
    icon: Magnifer,
    iconClassName:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
    trend: { direction: "up", text: "1 so với hôm qua" },
  },
  {
    label: "NCR chưa xử lý",
    value: 7,
    unit: "ncr",
    icon: DangerTriangle,
    iconClassName:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    trend: { direction: "down", text: "2 so với hôm qua" },
  },
]

export const alertItems: AlertItem[] = [
  {
    label: "Job trễ hạn",
    count: 5,
    icon: DangerTriangle,
    cardClassName:
      "border border-l-4 border-destructive/30 border-l-destructive bg-destructive/10",
    accentClassName: "text-destructive",
    subtitle: null,
  },
  {
    label: "Vật tư thiếu",
    count: 12,
    icon: Box,
    cardClassName:
      "border border-l-4 border-warning/30 border-l-warning bg-warning/10",
    accentClassName: "text-warning",
    subtitle: null,
  },
  {
    label: "OS trễ hạn",
    count: 3,
    icon: Delivery,
    cardClassName:
      "border border-l-4 border-destructive/30 border-l-destructive bg-destructive/10",
    accentClassName: "text-destructive",
    subtitle: null,
  },
  {
    label: "NCR chưa xử lý",
    count: 7,
    icon: DocumentText,
    cardClassName:
      "border border-l-4 border-rose-300 border-l-rose-500 bg-rose-50 dark:border-rose-800/40 dark:border-l-rose-500 dark:bg-rose-500/10",
    accentClassName: "text-rose-600 dark:text-rose-400",
    subtitle: null,
  },
  {
    label: "DO sắp giao",
    count: 8,
    icon: Delivery,
    cardClassName:
      "border border-l-4 border-blue-300 border-l-blue-500 bg-blue-50 dark:border-blue-800/40 dark:border-l-blue-500 dark:bg-blue-500/10",
    accentClassName: "text-blue-600 dark:text-blue-400",
    subtitle: "Trong 3 ngày tới",
  },
]

// Fixed categorical palette (job-status hues) — a donut split by status needs
// 7 distinct colors, so this draws straight from the theme's --chart-1..7
// tokens (each dark-mode-aware) instead of hardcoded hex.
export const productionProgress: ProductionProgressSlice[] = [
  { label: "Đang sản xuất", value: 25, colorVar: "var(--color-chart-1)" },
  { label: "Chờ vật tư", value: 4, colorVar: "var(--color-chart-6)" },
  { label: "Chờ OS", value: 3, colorVar: "var(--color-chart-4)" },
  { label: "Chờ QC", value: 5, colorVar: "var(--color-chart-3)" },
  { label: "Làm lại", value: 2, colorVar: "var(--color-chart-5)" },
  { label: "Hoàn thành", value: 18, colorVar: "var(--color-chart-2)" },
  { label: "Đã hủy", value: 3, colorVar: "var(--color-muted-foreground)" },
]

// Total jobs shown in the donut center. Mirrors the design mock: the 7 slices
// above are a partial breakdown, so percentages read against this grand total.
export const productionProgressTotal = 75

const overdueJobStatuses = [
  JobStatus.IN_PROGRESS,
  JobStatus.WAITING_OUTSOURCE,
  JobStatus.WAITING_MATERIAL,
  JobStatus.WAITING_QC,
  JobStatus.REWORK,
]

export const overdueJobs: OverdueJobRow[] = Array.from(
  { length: 5 },
  (_, index) => ({
    jobCode: jobCode(),
    poCode: poCode(),
    dueDate: recentDateLabel(),
    daysOverdue: faker.number.int({ min: 1, max: 5 }),
    status: overdueJobStatuses[index],
  })
)

const lowStockCatalog = [
  {
    materialCode: "STEEL-SS400-5",
    materialName: "Thép tấm SS400 5mm",
    unit: "Kg",
  },
  {
    materialCode: "STEEL-SS400-10",
    materialName: "Thép tấm SS400 10mm",
    unit: "Kg",
  },
  {
    materialCode: "BOLT-M12-050",
    materialName: "Bulong M12 x 50",
    unit: "Cái",
  },
  { materialCode: "NUT-M12", materialName: "Đai ốc M12", unit: "Cái" },
  { materialCode: "PAINT-POWDER", materialName: "Sơn tĩnh điện", unit: "Kg" },
]

export const lowStockMaterials: LowStockMaterialRow[] = lowStockCatalog.map(
  (material) => ({
    ...material,
    shortage: faker.number.int({ min: 20, max: 500 }),
  })
)

const outsourceOperations = [
  "Nhiệt luyện",
  "Mạ kẽm",
  "Sơn tĩnh điện",
  "Tiện CNC",
  "Phay CNC",
]

export const overdueOutsource: OverdueOutsourceRow[] = Array.from(
  { length: 3 },
  (_, index) => ({
    osCode: `OS-2405-${faker.number.int({ min: 1, max: 20 }).toString().padStart(2, "0")}`,
    supplierName: faker.company.name(),
    operation: outsourceOperations[index],
    dueDate: recentDateLabel(),
    daysOverdue: faker.number.int({ min: 1, max: 4 }),
  })
)

const ncrDefectTypes = [
  "Kích thước",
  "Mối hàn",
  "Sơn bong tróc",
  "Sai kích thước",
]
const openNcrSources = [
  NcrSource.IQC,
  NcrSource.OQC,
  NcrSource.OQC,
  NcrSource.MANUAL,
]
const openNcrStatuses = [
  NcrStatus.REWORK,
  NcrStatus.REWORK,
  NcrStatus.SCRAP,
  NcrStatus.PENDING,
]

export const openNcrs: OpenNcrRow[] = Array.from({ length: 4 }, (_, index) => ({
  ncrCode: `NCR-${(8 + index).toString().padStart(4, "0")}`,
  source: openNcrSources[index],
  type: ncrDefectTypes[index],
  createdAt: recentDateLabel(),
  status: openNcrStatuses[index],
}))

const upcomingDeliveryStatuses = [
  DoStatus.NOT_EXPORTED,
  DoStatus.NOT_EXPORTED,
  DoStatus.PREPARING,
  DoStatus.NOT_EXPORTED,
]

export const upcomingDeliveries: UpcomingDeliveryRow[] = Array.from(
  { length: 4 },
  (_, index) => ({
    doCode: `DO-2405-${(23 + index).toString().padStart(3, "0")}`,
    customerName: faker.company.name(),
    deliveryDate: recentDateLabel(),
    status: upcomingDeliveryStatuses[index],
  })
)

export const inventoryAlerts: InventoryAlertPoint[] = [
  "STEEL-SS400-5",
  "BOLT-M12-050",
  "NUT-M12",
  "PAINT-POWDER",
  "GAS-CO2",
].map((materialCode) => ({
  materialCode,
  belowMinimum: faker.number.int({ min: 20, max: 200 }),
  runningLow: faker.number.int({ min: 10, max: 80 }),
}))

export const qcRatePoints: QcRatePoint[] = [
  "14/05",
  "15/05",
  "16/05",
  "17/05",
  "18/05",
  "19/05",
  "20/05",
].map((date) => ({
  date,
  iqcPassRate: faker.number.int({ min: 85, max: 100 }),
  oqcPassRate: faker.number.int({ min: 75, max: 95 }),
}))

export const ncrByType: NcrByTypeSlice[] = [
  { label: "Kích thước", value: 9 },
  { label: "Mối hàn", value: 6 },
  { label: "Sơn", value: 4 },
  { label: "Biến dạng", value: 2 },
  { label: "Khác", value: 1 },
].map((slice, index) => ({ ...slice, colorVar: nextChartColor(index) }))

export const ncrByTypeTotal = ncrByType.reduce(
  (sum, slice) => sum + slice.value,
  0
)

export const quickActions: QuickAction[] = [
  {
    label: "Tạo LSX (Job)",
    icon: ClipboardAdd,
    accentClassName: "text-emerald-600 dark:text-emerald-400",
    tileClassName:
      "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
  },
  {
    label: "Tạo DO",
    icon: Delivery,
    accentClassName: "text-blue-600 dark:text-blue-400",
    tileClassName:
      "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-500/10 dark:hover:bg-blue-500/20",
  },
  {
    label: "Tạo NCR",
    icon: DocumentAdd,
    accentClassName: "text-red-600 dark:text-red-400",
    tileClassName:
      "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800/40 dark:bg-red-500/10 dark:hover:bg-red-500/20",
  },
  {
    label: "Đề xuất mua",
    icon: CartLarge2,
    accentClassName: "text-amber-600 dark:text-amber-400",
    tileClassName:
      "border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-500/10 dark:hover:bg-amber-500/20",
  },
  {
    label: "Nhập OS về",
    icon: InboxIn,
    accentClassName: "text-indigo-600 dark:text-indigo-400",
    tileClassName:
      "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
  },
  {
    label: "Nhập kho",
    icon: Box,
    accentClassName: "text-teal-600 dark:text-teal-400",
    tileClassName:
      "border-teal-200 bg-teal-50 hover:bg-teal-100 dark:border-teal-800/40 dark:bg-teal-500/10 dark:hover:bg-teal-500/20",
  },
  {
    label: "Xuất kho",
    icon: InboxOut,
    accentClassName: "text-cyan-600 dark:text-cyan-400",
    tileClassName:
      "border-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:border-cyan-800/40 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20",
  },
  {
    label: "Báo giá (RFQ)",
    icon: BillList,
    accentClassName: "text-violet-600 dark:text-violet-400",
    tileClassName:
      "border-violet-200 bg-violet-50 hover:bg-violet-100 dark:border-violet-800/40 dark:bg-violet-500/10 dark:hover:bg-violet-500/20",
  },
  {
    label: "PO mua hàng",
    icon: Bag4,
    accentClassName: "text-slate-600 dark:text-slate-400",
    tileClassName:
      "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700/40 dark:bg-slate-500/10 dark:hover:bg-slate-500/20",
  },
]

export const lastUpdatedAt = faker.date.recent({ days: 1 }).toISOString()
