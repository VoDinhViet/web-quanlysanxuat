import { TrashBinTrash } from "@solar-icons/react"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RemoveOperationAssignmentDialog } from "@/features/operations/components/composites/RemoveOperationAssignmentDialog"
import { OperationUserCell } from "@/features/operations/components/primitives/OperationUserCell"
import { employeeStatusLabels } from "@/lib/types/user.type"
import type { EmployeeStatus, UserListItem } from "@/lib/types/user.type"

const employeeStatusStyles: Record<EmployeeStatus, string> = {
  WORKING: "bg-success/15 text-success",
  RESIGNED: "bg-muted text-muted-foreground",
}

const assignmentColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  UserListItem
>()

type AssignmentColumnsOptions = {
  operationId: string
  // Rows already paged past, so the "#" column keeps counting across pages.
  offset: number
}

// A factory, not a module constant: the "#" column and the remove action depend on the page and
// on which operation this table belongs to. The caller memoizes the result.
export const buildOperationAssignmentColumns = ({
  operationId,
  offset,
}: AssignmentColumnsOptions) =>
  assignmentColumnHelper.columns([
    assignmentColumnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => offset + row.index + 1,
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
    }),
    assignmentColumnHelper.accessor("code", {
      header: "Mã nhân viên",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {getValue()}
        </span>
      ),
    }),
    assignmentColumnHelper.accessor("fullName", {
      header: "Họ và tên",
      meta: { headerClassName: "min-w-44", cellClassName: "font-normal" },
      cell: ({ row }) => <OperationUserCell user={row.original} />,
    }),
    assignmentColumnHelper.accessor((row) => row.department.name, {
      id: "department",
      header: "Phòng ban",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
    assignmentColumnHelper.accessor((row) => row.position.name, {
      id: "position",
      header: "Chức vụ",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
    assignmentColumnHelper.accessor("email", {
      header: "Email",
      meta: { headerClassName: "min-w-52" },
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    assignmentColumnHelper.accessor("status", {
      header: "Trạng thái",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => {
        const status = getValue()

        return (
          <Badge variant="outline" className={employeeStatusStyles[status]}>
            {employeeStatusLabels[status]}
          </Badge>
        )
      },
    }),
    assignmentColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "min-w-24 text-center",
        cellClassName: "font-normal",
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <PermissionGate permission="operations:update">
            <RemoveOperationAssignmentDialog
              operationId={operationId}
              user={row.original}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Gỡ khỏi công đoạn"
                  className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                >
                  <TrashBinTrash className="size-3.5" />
                </Button>
              }
            />
          </PermissionGate>
        </div>
      ),
    }),
  ])
