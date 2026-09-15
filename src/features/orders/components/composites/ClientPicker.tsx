import { useMemo, useState } from "react"
import type { MouseEvent } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Buildings2, Magnifer } from "@solar-icons/react"
import { MapPin, Pencil, Phone, Plus, User, X } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { clientQueryOptions, clientsQueryOptions } from "@/features/clients/api"
import {
  buildClientPickerColumns,
  clientPickerStatusStyles,
} from "@/features/orders/components/composites/ClientPickerColumns"
import { clientStatusLabels } from "@/lib/types/client.type"
import type { Client } from "@/lib/types/client.type"
import { cn } from "@/lib/utils"
import type { PageSize } from "@/components/shared/composites/Pagination"

export type ClientPickerProps = {
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  onClientSelect?: (client: Client | undefined) => void
  onBlur?: () => void
  isInvalid?: boolean
  disabled?: boolean
  onApplyAddress?: (address: string) => void
}

// Thay ComboboxField (chỉ hiện mã/tên, không phân trang thật — GET /clients/options bị BE cap
// cứng) bằng Dialog mở bảng khách hàng phân trang thật (GET /clients) — cần thiết để phân biệt
// khi 2 khách hàng trùng tên. Khi đã chọn, hiện lại một thẻ thông tin gọn (tên/mã/trạng thái +
// người liên hệ/điện thoại/địa chỉ) theo đúng khuôn OutboundOrderInfoCard.tsx's InfoTile — không
// avatar, không gradient, không badge màu tự chế: trạng thái dùng lại statusStyles y hệt
// ClientsTableColumns.tsx.
export function ClientPicker({
  value,
  onValueChange,
  onClientSelect,
  onBlur,
  isInvalid,
  disabled,
  onApplyAddress,
}: ClientPickerProps) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  // Resolves the label for a `value` set from outside a fresh pick (e.g. Update's
  // pre-filled clientId) — a fresh pick already has the full row from the table.
  const clientDetailQuery = useQuery({
    ...clientQueryOptions(value!),
    enabled: !!value,
  })

  const clientsListQuery = useQuery({
    ...clientsQueryOptions({
      page,
      limit: pageSize,
      q: debouncedQ.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
    enabled: open,
  })

  const clients = clientsListQuery.data?.data ?? []
  const pagination = clientsListQuery.data?.pagination

  const selectedClient = clientDetailQuery.data

  function handleSelectClient(client: Client) {
    onValueChange(client.id)
    onClientSelect?.(client)
    setOpen(false)
  }

  function handleClear(event: MouseEvent) {
    event.stopPropagation()
    onValueChange(undefined)
    onClientSelect?.(undefined)
  }

  const columns = useMemo(
    () => buildClientPickerColumns({ selectedId: value }),
    [value]
  )

  const table = useTable({
    data: clients,
    columns,
    features: appTableFeatures,
  })

  const primaryContact =
    selectedClient?.contacts.find((c) => c.isPrimary) ??
    selectedClient?.contacts[0]
  const phone = selectedClient?.phoneNumber || primaryContact?.phoneNumber

  return (
    <>
      {value ? (
        clientDetailQuery.isPending && !selectedClient ? (
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </div>
        ) : (
          <section
            data-invalid={isInvalid}
            className={cn(
              "rounded-lg border border-border bg-card p-4 shadow-card",
              "data-[invalid=true]:border-destructive"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Buildings2 className="size-4" />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {selectedClient?.name ?? "—"}
                    </h4>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {selectedClient?.code}
                    </span>
                    {selectedClient?.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0",
                          clientPickerStatusStyles[selectedClient.status].badge
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            clientPickerStatusStyles[selectedClient.status].dot
                          )}
                        />
                        {clientStatusLabels[selectedClient.status]}
                      </Badge>
                    )}
                  </div>

                  {selectedClient && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="size-3.5 shrink-0" />
                        {primaryContact?.name ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5 shrink-0" />
                        {phone ?? "—"}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {selectedClient.address || "Chưa cập nhật địa chỉ"}
                        </span>
                      </span>
                    </div>
                  )}

                  {selectedClient?.address && onApplyAddress && (
                    <button
                      type="button"
                      onClick={() => onApplyAddress(selectedClient.address!)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Dùng làm địa chỉ giao
                    </button>
                  )}
                </div>
              </div>

              {!disabled && (
                <div className="flex shrink-0 items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label="Đổi khách hàng"
                          onClick={() => setOpen(true)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent>Đổi khách hàng</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Bỏ chọn khách hàng"
                          onClick={handleClear}
                        >
                          <X className="size-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent>Bỏ chọn khách hàng</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </section>
        )
      ) : (
        <button
          type="button"
          disabled={disabled}
          onBlur={onBlur}
          onClick={() => setOpen(true)}
          data-invalid={isInvalid}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-xs text-muted-foreground transition-colors",
            "hover:border-primary/50",
            "focus-visible:ring-3 focus-visible:ring-ring/35 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[invalid=true]:border-destructive"
          )}
        >
          <Magnifer className="size-3.5 shrink-0" />
          Chọn khách hàng
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Buildings2 className="size-4 text-muted-foreground" />
              Chọn khách hàng
            </DialogTitle>
            <DialogDescription>
              Tìm và bấm vào một dòng để chọn khách hàng cho đơn hàng này.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                className="pr-8 pl-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm mã, tên, người liên hệ, số điện thoại..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
              />
              <Magnifer className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("")
                    setPage(1)
                  }}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <LinkButton
              to="/manage/clients/create"
              target="_blank"
              variant="outline"
              className="shrink-0 gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Tạo khách hàng
            </LinkButton>
          </div>

          <div className="max-h-110 overflow-x-auto overflow-y-auto rounded-lg border border-border/60 bg-card">
            <Table aria-label="Danh sách khách hàng">
              <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-xs [&>tr]:h-11">
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
                        colSpan={columns.length}
                        title={
                          clientsListQuery.isPending
                            ? "Đang tải danh sách..."
                            : "Không tìm thấy khách hàng"
                        }
                        description={
                          clientsListQuery.isPending
                            ? undefined
                            : "Thử một từ khoá khác hoặc bấm Tạo khách hàng mới."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const isSelected = row.original.id === value

                    return (
                      <TableRow
                        key={row.original.id}
                        className={cn(
                          "h-14 cursor-pointer border-l-2 border-l-transparent hover:bg-muted/30",
                          isSelected && "border-l-primary bg-primary/5"
                        )}
                        onClick={() => handleSelectClient(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={
                              cell.column.columnDef.meta?.cellClassName
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
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
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize)
                setPage(1)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
