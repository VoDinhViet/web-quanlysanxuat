import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { createColumnHelper } from "@tanstack/react-table"
import { Edit3, Eye, Trash2 } from "lucide-react"
import { DateTime } from "luxon"
import { toast } from "sonner"
import type { appTableFeatures } from "@/lib/table-features"

import { Button, LinkButton } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteDepartmentDialog } from "@/features/departments/components/composites/DeleteDepartmentDialog"
import { UpdateDepartmentDialog } from "@/features/departments/components/composites/UpdateDepartmentDialog"
import { updateDepartmentStatus } from "@/features/departments/api/server-functions/update-department-status.api"
import { useHasPermission } from "@/hooks/use-permissions"
import type { Department } from "@/lib/types/department.type"

type DepartmentStatusProps = {
  department: Department
}

function DepartmentStatus({ department }: DepartmentStatusProps) {
  const queryClient = useQueryClient()
  const updateDepartmentStatusFn = useServerFn(updateDepartmentStatus)
  const canUpdate = useHasPermission("departments:update")

  // Optimistic local echo of the toggle — the row's own `department.isActive` only catches up
  // once the invalidated query refetches, which would otherwise snap the switch back and forth.
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null)
  const isActive = pendingStatus ?? department.isActive ?? true

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (nextActive: boolean) => {
      setPendingStatus(nextActive)
      return updateDepartmentStatusFn({
        data: { departmentId: department.id, isActive: nextActive },
      })
    },
    onSuccess: async (_data, nextActive) => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success(
        nextActive
          ? `Đã kích hoạt phòng ban "${department.name}"`
          : `Đã ngừng hoạt động phòng ban "${department.name}"`
      )
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => setPendingStatus(null),
  })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="inline-flex">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => updateStatus(checked)}
              disabled={!canUpdate || isPending}
              aria-label={`Trạng thái phòng ban ${department.name}`}
            />
          </div>
        }
      />
      {!canUpdate && (
        <TooltipContent>Bạn không có quyền sửa phòng ban</TooltipContent>
      )}
    </Tooltip>
  )
}

type DepartmentActionsProps = {
  department: Department
}

function DepartmentActions({ department }: DepartmentActionsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <RoutePermissionGate route="/manage/departments/$departmentId">
        <Tooltip>
          <TooltipTrigger
            render={
              <LinkButton
                to="/manage/departments/$departmentId"
                params={{ departmentId: department.id }}
                variant="outline"
                size="icon-sm"
                aria-label="Xem chi tiết"
                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
              >
                <Eye className="size-3.5" />
              </LinkButton>
            }
          />
          <TooltipContent>Xem chi tiết</TooltipContent>
        </Tooltip>
      </RoutePermissionGate>
      <PermissionGate permission="departments:update">
        <UpdateDepartmentDialog
          department={department}
          trigger={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Chỉnh sửa"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Edit3 className="size-3.5" />
            </Button>
          }
        />
      </PermissionGate>
      <PermissionGate permission="departments:delete">
        <DeleteDepartmentDialog
          department={department}
          trigger={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Xóa"
              className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
      </PermissionGate>
    </div>
  )
}

const departmentColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Department
>()

export const departmentColumns = departmentColumnHelper.columns([
  departmentColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),
  departmentColumnHelper.accessor("code", {
    header: "Mã phòng ban",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),
  departmentColumnHelper.accessor("name", {
    header: "Tên phòng ban",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  departmentColumnHelper.accessor((department) => department.isActive ?? true, {
    id: "isActive",
    header: "Trạng thái",
    meta: { headerClassName: "w-28 text-center", cellClassName: "text-center" },
    cell: ({ row }) => <DepartmentStatus department={row.original} />,
  }),
  departmentColumnHelper.accessor("positionCount", {
    header: "Chức vụ",
    meta: { headerClassName: "w-24" },
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{getValue()}</span>
    ),
  }),
  departmentColumnHelper.accessor("employeeCount", {
    header: "Nhân sự",
    meta: { headerClassName: "w-24" },
    cell: ({ row }) => {
      const department = row.original

      return (
        <LinkButton
          to="/manage/users"
          search={{ page: 1, limit: 10, departmentId: department.id }}
          variant="link"
          size="xs"
          className="px-0 text-xs font-medium"
        >
          {department.employeeCount}
        </LinkButton>
      )
    },
  }),
  departmentColumnHelper.accessor("updatedAt", {
    header: "Ngày cập nhật",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => {
      const updatedAt = getValue()

      return (
        <span className="text-xs text-muted-foreground">
          {updatedAt
            ? DateTime.fromISO(updatedAt).toFormat("dd/MM/yyyy HH:mm")
            : "—"}
        </span>
      )
    },
  }),
  departmentColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <DepartmentActions department={row.original} />,
  }),
])
