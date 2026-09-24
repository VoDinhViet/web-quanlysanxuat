import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Buildings2, Magnifer } from "@solar-icons/react"
import { Plus, X } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/shared/composites/Pagination"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { clientsQueryOptions } from "@/features/clients/api"
import { ClientPickerOption } from "@/features/orders/components/composites/ClientPickerOption"
import type { Client } from "@/lib/types/client.type"

// Fixed page size — the list is a stack of tall rows, six fit without scrolling the dialog.
const CLIENT_PICKER_PAGE_SIZE = 6

type ClientPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId: string | undefined
  onSelect: (client: Client) => void
}

export function ClientPickerDialog({
  open,
  onOpenChange,
  selectedId,
  onSelect,
}: ClientPickerDialogProps) {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  const clientsQuery = useQuery({
    ...clientsQueryOptions({
      page,
      limit: CLIENT_PICKER_PAGE_SIZE,
      q: debouncedQ.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
    enabled: open,
  })

  const clients = clientsQuery.data?.data ?? []
  const pagination = clientsQuery.data?.pagination

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Buildings2 className="size-4.5 text-primary" />
            <span>Chọn khách hàng</span>
          </DialogTitle>
          <DialogDescription>
            Tìm theo mã, tên, người liên hệ hoặc số điện thoại, rồi bấm vào
            khách hàng để chọn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              className="pl-9 pr-8 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm theo tên, mã khách hàng, người liên hệ, SĐT..."
              value={q}
              onChange={(event) => {
                setQ(event.target.value)
                setPage(1)
              }}
              autoFocus
            />
            <Magnifer className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            {q && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => {
                  setQ("")
                  setPage(1)
                }}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          {/* Not LinkButton: the router link renders a <button>, which ignores
              target="_blank" and so did nothing on click. */}
          <RoutePermissionGate route="/manage/clients/create">
            <Button
              type="button"
              onClick={() =>
                window.open("/manage/clients/create", "_blank", "noopener")
              }
            >
              <Plus />
              <span>Thêm khách hàng</span>
            </Button>
          </RoutePermissionGate>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {clientsQuery.isPending ? (
            Array.from({ length: CLIENT_PICKER_PAGE_SIZE }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border/60 px-3 py-3 last:border-b-0"
              >
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : clients.length === 0 ? (
            <div className="py-8">
              <TableEmpty
                title="Không tìm thấy khách hàng"
                description="Thử từ khóa khác hoặc tạo khách hàng mới."
              />
            </div>
          ) : (
            clients.map((client) => (
              <ClientPickerOption
                key={client.id}
                client={client}
                isSelected={client.id === selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>

        {pagination && (
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.limit}
            total={pagination.totalRecords}
            onPageChange={setPage}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
