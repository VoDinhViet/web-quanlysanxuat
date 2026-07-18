import bag4Bold from "@iconify-icons/solar/bag-4-bold"
import billListBold from "@iconify-icons/solar/bill-list-bold"
import boxBold from "@iconify-icons/solar/box-bold"
import buildings2Bold from "@iconify-icons/solar/buildings-2-bold"
import cartLarge2Bold from "@iconify-icons/solar/cart-large-2-bold"
import clipboardAddBold from "@iconify-icons/solar/clipboard-add-bold"
import clockCircleBold from "@iconify-icons/solar/clock-circle-bold"
import dangerTriangleBold from "@iconify-icons/solar/danger-triangle-bold"
import deliveryBold from "@iconify-icons/solar/delivery-bold"
import documentAddBold from "@iconify-icons/solar/document-add-bold"
import documentTextBold from "@iconify-icons/solar/document-text-bold"
import inboxInBold from "@iconify-icons/solar/inbox-in-bold"
import inboxOutBold from "@iconify-icons/solar/inbox-out-bold"
import magniferBold from "@iconify-icons/solar/magnifer-bold"
import { faker } from "@faker-js/faker"

import {
  DoStatus,
  JobStatus,
  NcrSource,
  NcrStatus,
} from "@/features/manage/types/manage.type"
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
} from "@/features/manage/types/manage.type"

// Mock data for the Dashboard UI — no backend endpoint exists for these
// widgets yet. Seeded so the layout stays stable across reloads; replace
// with real server-function data once the API exists (see architecture.md).
faker.seed(2026)

const CHART_COLOR_VARS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

function nextChartColor(index: number): string {
  return CHART_COLOR_VARS[index % CHART_COLOR_VARS.length]
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

export const STAT_CARDS: StatCard[] = [
  {
    label: "PO đang chạy",
    value: 42,
    unit: "đơn",
    icon: deliveryBold,
    iconClassName: "bg-blue-100 text-blue-700",
    trend: { direction: "up", text: "12% so với tuần trước" },
  },
  {
    label: "PO trễ hạn",
    value: 5,
    unit: "đơn",
    icon: clockCircleBold,
    iconClassName: "bg-red-100 text-red-700",
    trend: { direction: "up", text: "2 so với hôm qua" },
  },
  {
    label: "PO sắp giao",
    value: 12,
    unit: "đơn",
    icon: boxBold,
    iconClassName: "bg-amber-100 text-amber-700",
    trend: { text: "Trong 3 ngày tới" },
  },
  {
    label: "Job đang sản xuất",
    value: 25,
    unit: "job",
    icon: buildings2Bold,
    iconClassName: "bg-emerald-100 text-emerald-700",
    trend: { direction: "up", text: "8 so với hôm qua" },
  },
  {
    label: "Chờ QC",
    value: 5,
    unit: "job",
    icon: magniferBold,
    iconClassName: "bg-indigo-100 text-indigo-700",
    trend: { direction: "up", text: "1 so với hôm qua" },
  },
  {
    label: "NCR chưa xử lý",
    value: 7,
    unit: "ncr",
    icon: dangerTriangleBold,
    iconClassName: "bg-rose-100 text-rose-700",
    trend: { direction: "down", text: "2 so với hôm qua" },
  },
]

export const ALERT_ITEMS: AlertItem[] = [
  {
    label: "Job trễ hạn",
    count: 5,
    icon: dangerTriangleBold,
    cardClassName:
      "border border-l-4 border-red-300 border-l-red-500 bg-red-50",
    accentClassName: "text-red-600",
    subtitle: null,
  },
  {
    label: "Vật tư thiếu",
    count: 12,
    icon: boxBold,
    cardClassName:
      "border border-l-4 border-amber-300 border-l-amber-500 bg-amber-50",
    accentClassName: "text-amber-600",
    subtitle: null,
  },
  {
    label: "OS trễ hạn",
    count: 3,
    icon: deliveryBold,
    cardClassName:
      "border border-l-4 border-orange-300 border-l-orange-500 bg-orange-50",
    accentClassName: "text-orange-600",
    subtitle: null,
  },
  {
    label: "NCR chưa xử lý",
    count: 7,
    icon: documentTextBold,
    cardClassName:
      "border border-l-4 border-rose-300 border-l-rose-500 bg-rose-50",
    accentClassName: "text-rose-600",
    subtitle: null,
  },
  {
    label: "DO sắp giao",
    count: 8,
    icon: deliveryBold,
    cardClassName:
      "border border-l-4 border-blue-300 border-l-blue-500 bg-blue-50",
    accentClassName: "text-blue-600",
    subtitle: "Trong 3 ngày tới",
  },
]

// Fixed categorical palette (job-status hues) — the theme's --chart-1..5
// tokens are all blue-ish, so a donut split by status needs distinct colors
// the design system doesn't provide. Hex values are Tailwind's *-500 steps.
export const PRODUCTION_PROGRESS: ProductionProgressSlice[] = [
  { label: "Đang sản xuất", value: 25, colorVar: "#3b82f6" },
  { label: "Chờ vật tư", value: 4, colorVar: "#f97316" },
  { label: "Chờ OS", value: 3, colorVar: "#8b5cf6" },
  { label: "Chờ QC", value: 5, colorVar: "#f59e0b" },
  { label: "Làm lại", value: 2, colorVar: "#ef4444" },
  { label: "Hoàn thành", value: 18, colorVar: "#22c55e" },
  { label: "Đã hủy", value: 3, colorVar: "#9ca3af" },
]

// Total jobs shown in the donut center. Mirrors the design mock: the 7 slices
// above are a partial breakdown, so percentages read against this grand total.
export const PRODUCTION_PROGRESS_TOTAL = 75

const OVERDUE_JOB_STATUSES = [
  JobStatus.IN_PROGRESS,
  JobStatus.WAITING_OUTSOURCE,
  JobStatus.WAITING_MATERIAL,
  JobStatus.WAITING_QC,
  JobStatus.REWORK,
]

export const OVERDUE_JOBS: OverdueJobRow[] = Array.from(
  { length: 5 },
  (_, index) => ({
    jobCode: jobCode(),
    poCode: poCode(),
    dueDate: recentDateLabel(),
    daysOverdue: faker.number.int({ min: 1, max: 5 }),
    status: OVERDUE_JOB_STATUSES[index],
  })
)

const LOW_STOCK_CATALOG = [
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

export const LOW_STOCK_MATERIALS: LowStockMaterialRow[] = LOW_STOCK_CATALOG.map(
  (material) => ({
    ...material,
    shortage: faker.number.int({ min: 20, max: 500 }),
  })
)

const OUTSOURCE_OPERATIONS = [
  "Nhiệt luyện",
  "Mạ kẽm",
  "Sơn tĩnh điện",
  "Tiện CNC",
  "Phay CNC",
]

export const OVERDUE_OUTSOURCE: OverdueOutsourceRow[] = Array.from(
  { length: 3 },
  (_, index) => ({
    osCode: `OS-2405-${faker.number.int({ min: 1, max: 20 }).toString().padStart(2, "0")}`,
    supplierName: faker.company.name(),
    operation: OUTSOURCE_OPERATIONS[index],
    dueDate: recentDateLabel(),
    daysOverdue: faker.number.int({ min: 1, max: 4 }),
  })
)

const NCR_DEFECT_TYPES = [
  "Kích thước",
  "Mối hàn",
  "Sơn bong tróc",
  "Sai kích thước",
]
const OPEN_NCR_SOURCES = [
  NcrSource.IQC,
  NcrSource.OQC,
  NcrSource.OQC,
  NcrSource.MANUAL,
]
const OPEN_NCR_STATUSES = [
  NcrStatus.REWORK,
  NcrStatus.REWORK,
  NcrStatus.SCRAP,
  NcrStatus.PENDING,
]

export const OPEN_NCRS: OpenNcrRow[] = Array.from(
  { length: 4 },
  (_, index) => ({
    ncrCode: `NCR-${(8 + index).toString().padStart(4, "0")}`,
    source: OPEN_NCR_SOURCES[index],
    type: NCR_DEFECT_TYPES[index],
    createdAt: recentDateLabel(),
    status: OPEN_NCR_STATUSES[index],
  })
)

const UPCOMING_DELIVERY_STATUSES = [
  DoStatus.NOT_EXPORTED,
  DoStatus.NOT_EXPORTED,
  DoStatus.PREPARING,
  DoStatus.NOT_EXPORTED,
]

export const UPCOMING_DELIVERIES: UpcomingDeliveryRow[] = Array.from(
  { length: 4 },
  (_, index) => ({
    doCode: `DO-2405-${(23 + index).toString().padStart(3, "0")}`,
    customerName: faker.company.name(),
    deliveryDate: recentDateLabel(),
    status: UPCOMING_DELIVERY_STATUSES[index],
  })
)

export const INVENTORY_ALERTS: InventoryAlertPoint[] = [
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

export const QC_RATE_POINTS: QcRatePoint[] = [
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

export const NCR_BY_TYPE: NcrByTypeSlice[] = [
  { label: "Kích thước", value: 9 },
  { label: "Mối hàn", value: 6 },
  { label: "Sơn", value: 4 },
  { label: "Biến dạng", value: 2 },
  { label: "Khác", value: 1 },
].map((slice, index) => ({ ...slice, colorVar: nextChartColor(index) }))

export const NCR_BY_TYPE_TOTAL = NCR_BY_TYPE.reduce(
  (sum, slice) => sum + slice.value,
  0
)

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Tạo LSX (Job)",
    icon: clipboardAddBold,
    accentClassName: "text-emerald-600",
    tileClassName: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
  },
  {
    label: "Tạo DO",
    icon: deliveryBold,
    accentClassName: "text-blue-600",
    tileClassName: "border-blue-200 bg-blue-50 hover:bg-blue-100",
  },
  {
    label: "Tạo NCR",
    icon: documentAddBold,
    accentClassName: "text-red-600",
    tileClassName: "border-red-200 bg-red-50 hover:bg-red-100",
  },
  {
    label: "Đề xuất mua",
    icon: cartLarge2Bold,
    accentClassName: "text-amber-600",
    tileClassName: "border-amber-200 bg-amber-50 hover:bg-amber-100",
  },
  {
    label: "Nhập OS về",
    icon: inboxInBold,
    accentClassName: "text-indigo-600",
    tileClassName: "border-indigo-200 bg-indigo-50 hover:bg-indigo-100",
  },
  {
    label: "Nhập kho",
    icon: boxBold,
    accentClassName: "text-teal-600",
    tileClassName: "border-teal-200 bg-teal-50 hover:bg-teal-100",
  },
  {
    label: "Xuất kho",
    icon: inboxOutBold,
    accentClassName: "text-cyan-600",
    tileClassName: "border-cyan-200 bg-cyan-50 hover:bg-cyan-100",
  },
  {
    label: "Báo giá (RFQ)",
    icon: billListBold,
    accentClassName: "text-violet-600",
    tileClassName: "border-violet-200 bg-violet-50 hover:bg-violet-100",
  },
  {
    label: "PO mua hàng",
    icon: bag4Bold,
    accentClassName: "text-slate-600",
    tileClassName: "border-slate-200 bg-slate-50 hover:bg-slate-100",
  },
]

export const LAST_UPDATED_AT = faker.date.recent({ days: 1 }).toISOString()
