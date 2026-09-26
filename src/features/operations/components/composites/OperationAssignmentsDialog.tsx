import { useMemo, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Diskette, Magnifier, UsersGroupRounded } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"
import { toast } from "sonner"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { operationAssignmentIdsQueryOptions } from "@/features/operations/api/options"
import { setOperationAssignments } from "@/features/operations/api/server-functions/set-operation-assignments.api"
import { buildAssignableUserColumns } from "@/features/operations/components/composites/AssignableUsersTableColumns"
import { usersQueryOptions } from "@/features/users/api"

// Cỡ trang cố định cho bảng trong dialog — không có selector đổi cỡ trang (Pagination ẩn selector
// khi bỏ qua `onPageSizeChange`).
const PAGE_SIZE = 10

type OperationAssignmentsDialogProps = {
  operationId: string
  operationName: string
  trigger: ReactElement
}

export function OperationAssignmentsDialog({
  operationId,
  operationName,
  trigger,
}: OperationAssignmentsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-4xl">
        {/* The dialog unmounts content while closed, so the selection starts empty on every open. */}
        <OperationAssignmentsEditor
          operationId={operationId}
          operationName={operationName}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type OperationAssignmentsEditorProps = {
  operationId: string
  operationName: string
  onClose: () => void
}

// Add-only picker: staff already assigned to this operation are filtered out server-side, so the
// selection is just who to add; removing someone is the row action on the detail page's table.
function OperationAssignmentsEditor({
  operationId,
  operationName,
  onClose,
}: OperationAssignmentsEditorProps) {
  const queryClient = useQueryClient()
  const setOperationAssignmentsFn = useServerFn(setOperationAssignments)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  // Only staff still working and not yet on this operation are listed; the selection persists
  // across pages and searches.
  const usersQuery = useQuery({
    ...usersQueryOptions({
      page,
      limit: PAGE_SIZE,
      q: debouncedQ.trim() || undefined,
      status: "WORKING",
      excludeOperationId: operationId,
    }),
    placeholderData: keepPreviousData,
  })
  const pageUsers = useMemo(
    () => usersQuery.data?.data ?? [],
    [usersQuery.data]
  )
  const pagination = usersQuery.data?.pagination

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      // The endpoint replaces the whole list, so re-read the current ids right now and add to
      // them, instead of trusting a copy another session may have changed.
      const currentIds = await queryClient.query({
        ...operationAssignmentIdsQueryOptions(operationId),
        staleTime: 0,
      })

      await setOperationAssignmentsFn({
        data: {
          operationId,
          userIds: [...new Set([...currentIds, ...selectedIds])],
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["operations", "assignments"],
      })
      onClose()
    },
    onError: (error) => toast.error(error.message),
  })

  const columns = useMemo(
    () =>
      buildAssignableUserColumns({
        selectedIds,
        pageUsers,
        onToggle: (userId) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(userId)) {
              next.delete(userId)
            } else {
              next.add(userId)
            }
            return next
          }),
        onTogglePage: (checked) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            for (const user of pageUsers) {
              if (checked) {
                next.add(user.id)
              } else {
                next.delete(user.id)
              }
            }
            return next
          }),
      }),
    [selectedIds, pageUsers]
  )

  const table = useTable({
    data: pageUsers,
    columns,
    features: appTableFeatures,
  })

  return (
    <>
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Phân công nhân sự — {operationName}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chỉ hiện nhân sự chưa thuộc công đoạn này. Tick chọn nhiều người cùng
          lúc; lựa chọn được giữ khi chuyển trang.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2.5">
        <div className="relative">
          <Input
            aria-label="Tìm nhân sự"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm theo mã hoặc tên..."
            value={q}
            disabled={isPending}
            onChange={(event) => {
              setQ(event.target.value)
              setPage(1)
            }}
          />
          <Magnifier className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách nhân sự để phân công">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
              <TableRow>
                {table.getFlatHeaders().map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <TableEmpty
                      icon={UsersGroupRounded}
                      colSpan={columns.length}
                      title={
                        usersQuery.isPending
                          ? "Đang tải..."
                          : usersQuery.isError
                            ? usersQuery.error.message
                            : "Không tìm thấy kết quả"
                      }
                      description={
                        usersQuery.isPending || usersQuery.isError
                          ? undefined
                          : "Thử một từ khoá khác hoặc kiểm tra lại chính tả."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-14 bg-card hover:bg-muted/25"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.cellClassName}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.limit}
            total={pagination.totalRecords}
            onPageChange={setPage}
            disabled={isPending}
          />
        )}

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-foreground">
            Đã chọn {selectedIds.size} nhân sự
          </span>
          {selectedIds.size > 0 && (
            <Button
              type="button"
              variant="link"
              size="xs"
              className="px-0 text-xs"
              disabled={isPending}
              onClick={() => setSelectedIds(new Set())}
            >
              Bỏ chọn tất cả
            </Button>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          Thoát
        </Button>
        <Button
          type="button"
          disabled={isPending || selectedIds.size === 0}
          onClick={() => save()}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Đang lưu
            </>
          ) : (
            <>
              <Diskette className="size-4" />
              Thêm vào công đoạn
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  )
}
