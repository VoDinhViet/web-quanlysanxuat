import { useQuery } from "@tanstack/react-query"
import { Buildings2 } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { positionOptionsQueryOptions } from "@/features/positions/api"
import type { DepartmentDetail } from "@/lib/types/department.type"
import { cn } from "@/lib/utils"

type DepartmentOverviewSectionProps = {
  department: DepartmentDetail
}

// Cycles the app's chart tokens (see src/styles.css) rather than one flat color — with up to 6
// positions shown, each bar reads as its own row even at a glance, not just a value gradient.
const barColorVars = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]
const maxRankedPositions = 6

export function DepartmentOverviewSection({
  department,
}: DepartmentOverviewSectionProps) {
  // Same query key as DepartmentPositionsSection — React Query dedupes, so this doesn't cost a
  // second request beyond what that section already fetches.
  const positionsQuery = useQuery(positionOptionsQueryOptions(department.id))
  const positions = positionsQuery.data ?? []
  const rankedPositions = [...positions]
    .sort((a, b) => b.employeeCount - a.employeeCount)
    .slice(0, maxRankedPositions)
  const maxEmployeeCount = Math.max(
    1,
    ...rankedPositions.map((position) => position.employeeCount)
  )

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Buildings2 className="size-4 text-muted-foreground" />
        Tổng quan phòng ban
      </div>

      <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60">
        <div className="px-4 py-4 sm:px-5">
          <p className="text-2xl font-bold text-foreground">
            {department.positionCount}
          </p>
          <p className="text-xs text-muted-foreground">Chức vụ</p>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <p className="text-2xl font-bold text-foreground">
            {department.employeeCount}
          </p>
          <p className="text-xs text-muted-foreground">Nhân sự</p>
        </div>
      </div>

      <div className="border-b border-border/60 px-4 py-4 sm:px-5">
        <h3 className="mb-3 text-xs font-semibold text-foreground">
          Phân bổ nhân sự theo chức vụ
        </h3>

        {positionsQuery.isPending ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : rankedPositions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa có chức vụ nào trong phòng ban này.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {rankedPositions.map((position, index) => (
              <li key={position.id} className="flex items-center gap-2.5">
                <span
                  className="w-24 shrink-0 truncate text-xs text-foreground"
                  title={position.name}
                >
                  {position.name}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full transition-[width]"
                    style={{
                      width: `${(position.employeeCount / maxEmployeeCount) * 100}%`,
                      backgroundColor:
                        barColorVars[index % barColorVars.length],
                    }}
                  />
                </span>
                <span className="w-5 shrink-0 text-right text-xs font-semibold text-foreground tabular-nums">
                  {position.employeeCount}
                </span>
              </li>
            ))}
          </ul>
        )}

        {positions.length > maxRankedPositions && (
          <p className="mt-2.5 text-[11px] text-muted-foreground">
            +{positions.length - maxRankedPositions} chức vụ khác
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
        <InfoRow
          label="Trạng thái"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  department.isActive !== false
                    ? "bg-success"
                    : "bg-muted-foreground/50"
                )}
              />
              <span
                className={cn(
                  department.isActive !== false
                    ? "text-success"
                    : "text-muted-foreground"
                )}
              >
                {department.isActive !== false
                  ? "Đang hoạt động"
                  : "Ngừng hoạt động"}
              </span>
            </span>
          }
        />
        {department.createdAt && (
          <InfoRow
            label="Ngày tạo"
            value={DateTime.fromISO(department.createdAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
        )}
        {department.updatedAt && (
          <InfoRow
            label="Cập nhật lần cuối"
            value={DateTime.fromISO(department.updatedAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
        )}
      </div>
    </section>
  )
}

type InfoRowProps = {
  label: string
  value: ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  )
}
