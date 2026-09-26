import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import { OperationUserCell } from "@/features/operations/components/primitives/OperationUserCell"
import type { UserListItem } from "@/lib/types/user.type"

const assignableColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  UserListItem
>()

type AssignableColumnsOptions = {
  selectedIds: ReadonlySet<string>
  pageUsers: UserListItem[]
  onToggle: (userId: string) => void
  onTogglePage: (checked: boolean) => void
}

// A factory: the checkboxes read the dialog's selection, which lives across pages. The caller
// memoizes the result.
export const buildAssignableUserColumns = ({
  selectedIds,
  pageUsers,
  onToggle,
  onTogglePage,
}: AssignableColumnsOptions) => {
  const selectedOnPage = pageUsers.filter((user) => selectedIds.has(user.id))
  const isAllSelected =
    pageUsers.length > 0 && selectedOnPage.length === pageUsers.length
  const isSomeSelected = selectedOnPage.length > 0 && !isAllSelected

  return assignableColumnHelper.columns([
    assignableColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          aria-label="Chọn tất cả nhân sự trong trang"
          checked={isAllSelected}
          indeterminate={isSomeSelected}
          onCheckedChange={(checked) => onTogglePage(checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Chọn ${row.original.fullName}`}
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => onToggle(row.original.id)}
        />
      ),
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
    }),
    assignableColumnHelper.accessor("code", {
      header: "Mã nhân viên",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {getValue()}
        </span>
      ),
    }),
    assignableColumnHelper.accessor("fullName", {
      header: "Họ và tên",
      meta: { headerClassName: "min-w-44", cellClassName: "font-normal" },
      cell: ({ row }) => <OperationUserCell user={row.original} />,
    }),
    assignableColumnHelper.accessor((row) => row.department.name, {
      id: "department",
      header: "Phòng ban",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
    assignableColumnHelper.accessor((row) => row.position.name, {
      id: "position",
      header: "Chức vụ",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
  ])
}
