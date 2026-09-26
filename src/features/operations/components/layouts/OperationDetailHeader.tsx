import { useQuery } from "@tanstack/react-query"
import {
  AltArrowLeft,
  CalendarDate,
  ClockCircle,
  CpuBolt,
  Diskette,
  UserRounded,
  UsersGroupRounded,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { DateTime } from "luxon"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { operationAssignmentIdsQueryOptions } from "@/features/operations/api/options"
import {
  OperationStatus,
  operationStatusLabels,
} from "@/lib/types/operation.type"
import { cn } from "@/lib/utils"
import type { OperationDetail } from "@/lib/types/operation.type"

type OperationDetailHeaderProps = {
  operation: OperationDetail
  isSaving: boolean
  onSave: () => void
}

// Identity + save on the first line, the read-only facts as one quiet line under it — a single
// compact block instead of separate bands.
export function OperationDetailHeader({
  operation,
  isSaving,
  onSave,
}: OperationDetailHeaderProps) {
  const isActive = operation.status === OperationStatus.ACTIVE

  // Reads the unpaginated id list, so the count is the true total, not one page. A failed read (no
  // operations:read) just shows a dash instead of a number.
  const { data: assignmentIds } = useQuery(
    operationAssignmentIdsQueryOptions(operation.id)
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <LinkButton
          to="/manage/settings/operations"
          search={{ page: 1, limit: 10 }}
          variant="ghost"
          className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Quay lại danh sách công đoạn"
        >
          <AltArrowLeft className="size-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </LinkButton>

        <div className="flex size-9 shrink-0 items-center justify-center text-info">
          <CpuBolt className="size-7" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="min-w-0 truncate text-base leading-snug font-bold text-foreground sm:text-lg">
              {operation.name}
            </h2>
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
              {operation.code}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5",
                isActive
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isActive ? "bg-success" : "bg-muted-foreground/50"
                )}
              />
              {operationStatusLabels[operation.status]}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <MetaItem icon={UsersGroupRounded}>
              <strong className="font-semibold text-foreground tabular-nums">
                {assignmentIds?.length ?? "—"}
              </strong>{" "}
              nhân sự
            </MetaItem>
            <MetaItem icon={UserRounded}>
              {operation.creatorBy?.fullName ?? "—"}
            </MetaItem>
            <MetaItem icon={CalendarDate}>
              Tạo{" "}
              {DateTime.fromISO(operation.createdAt).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            </MetaItem>
            <MetaItem icon={ClockCircle}>
              Cập nhật{" "}
              {DateTime.fromISO(operation.updatedAt).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            </MetaItem>
          </div>
        </div>
      </div>

      <PermissionGate permission="operations:update">
        <Button type="button" disabled={isSaving} onClick={onSave}>
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" />
              Đang lưu
            </>
          ) : (
            <>
              <Diskette className="size-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </PermissionGate>
    </div>
  )
}

type MetaItemProps = {
  icon: ComponentType<IconProps>
  children: ReactNode
}

function MetaItem({ icon: Icon, children }: MetaItemProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5" />
      <span>{children}</span>
    </span>
  )
}
