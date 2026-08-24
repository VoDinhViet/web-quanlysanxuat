import { ArrowDown, ArrowUp } from "lucide-react"
import {
  Box,
  Buildings2,
  ClockCircle,
  DangerTriangle,
  Delivery,
  Magnifer,
} from "@solar-icons/react"

import type { ReportStats } from "@/lib/types/report.type"
import type { StatCard, TrendDirection } from "@/lib/types/manage.type"

const countFormatter = new Intl.NumberFormat("vi-VN")

// diff = null → không đủ dữ liệu để so sánh (filter đang bật, hoặc chưa có kỳ trước) → ẩn hẳn
// dòng trend. diff = 0 → "Không đổi". Khác 0 → dấu (lên/xuống) + độ lớn đã format. `formatMagnitude`
// tách phần đếm-thô/phần-trăm ra khỏi nhánh chung, cùng khuôn `formatSignedTrend` của
// order-stat-tiles.ts.
function formatTrend(
  diff: number | null,
  period: string,
  formatMagnitude: (absValue: number) => string
): StatCard["trend"] {
  if (diff === null) {
    return null
  }

  if (diff === 0) {
    return { text: `Không đổi so với ${period}` }
  }

  return {
    direction: diff > 0 ? "up" : "down",
    text: `${formatMagnitude(Math.abs(diff))} so với ${period}`,
  }
}

function formatCount(value: number): string {
  return countFormatter.format(value)
}

function formatPercent(value: number): string {
  return `${countFormatter.format(value)}%`
}

export function getTrendIcon(direction: TrendDirection | undefined) {
  if (direction === "up") return ArrowUp
  if (direction === "down") return ArrowDown
  return null
}

// Icon + màu thuần thị giác, giữ y hệt 6 thẻ mock cũ (manage-dashboard.mock.ts) — không đổi khi
// ghép API thật. Sống cạnh `ManageStatCards` (consumer duy nhất) chứ không trong `features/reports/`
// — `reports` là feature api-only (không có page/component riêng), đúng khuôn
// `.claude/rules/architecture.md` cho tài nguyên không có màn hình riêng.
export function buildReportStatsTiles(stats: ReportStats): StatCard[] {
  return [
    {
      label: "PO đang chạy",
      value: stats.runningOrders,
      unit: "đơn",
      icon: Delivery,
      iconClassName:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
      trend: formatTrend(
        stats.runningOrdersTrendPercent,
        "tuần trước",
        formatPercent
      ),
    },
    {
      label: "PO trễ hạn",
      value: stats.overdueOrders,
      unit: "đơn",
      icon: ClockCircle,
      iconClassName: "bg-destructive/15 text-destructive",
      trend: formatTrend(stats.overdueOrdersTrendCount, "hôm qua", formatCount),
    },
    {
      label: "PO sắp giao",
      value: stats.upcomingDueOrders,
      unit: "đơn",
      icon: Box,
      iconClassName:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
      // upcomingDueWindowDays null khi có filter (endDate của filter thay cho cửa sổ cố định) —
      // FE đã tự biết khoảng ngày nó gửi lên nên không cần BE echo lại để hiện subtitle, chỉ ẩn
      // dòng này đi giống 5 thẻ kia.
      trend:
        stats.upcomingDueWindowDays === null
          ? null
          : { text: `Trong ${stats.upcomingDueWindowDays} ngày tới` },
    },
    {
      label: "Job đang sản xuất",
      value: stats.runningJobs,
      unit: "job",
      icon: Buildings2,
      iconClassName: "bg-success/15 text-success",
      trend: formatTrend(stats.runningJobsTrendCount, "hôm qua", formatCount),
    },
    {
      label: "Chờ QC",
      value: stats.jobsWaitingQc,
      unit: "job",
      icon: Magnifer,
      iconClassName:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
      trend: formatTrend(
        stats.jobsWaitingQcTrendCount,
        "hôm qua",
        formatCount
      ),
    },
    {
      label: "NCR chưa xử lý",
      value: stats.openNcr,
      unit: "ncr",
      icon: DangerTriangle,
      iconClassName:
        "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
      trend: formatTrend(stats.openNcrTrendCount, "hôm qua", formatCount),
    },
  ]
}
