import { useState } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { heldRequisitionsQueryOptions } from "@/features/inventory-directs/api"
import { HeldRequisitionsTable } from "@/features/inventory-directs/components/composites/HeldRequisitionsTable"
import { InventoryDirectInfoCard } from "@/features/inventory-directs/components/composites/InventoryDirectInfoCard"
import { InventoryDirectStockBox } from "@/features/inventory-directs/components/composites/InventoryDirectStockBox"
import { HeldRequisitionsFilter } from "@/features/inventory-directs/components/sections/HeldRequisitionsFilter"
import { HELD_REQUISITIONS_PAGE_SIZE } from "@/lib/types/held-requisition.type"
import type { HeldRequisitionsSearch } from "@/lib/types/held-requisition.type"
import type { DirectInventoryItem } from "@/lib/types/inventory-direct.type"

const INITIAL_SEARCH: HeldRequisitionsSearch = {
  page: 1,
  limit: HELD_REQUISITIONS_PAGE_SIZE,
}

type HeldRequisitionsDialogProps = {
  item: DirectInventoryItem | null
  onClose: () => void
}

// "Chi tiết số lượng đã giữ" của một vật tư, mở từ dòng của Tồn kho vật tư. `item` là dòng của
// danh sách nên số Tồn/Đã giữ luôn khớp danh sách và tự cập nhật khi danh sách được đọc lại.
export function HeldRequisitionsDialog({
  item,
  onClose,
}: HeldRequisitionsDialogProps) {
  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[92vh] gap-4 overflow-y-auto sm:max-w-7xl">
        {item && (
          <HeldRequisitionsDialogBody
            key={item.id}
            item={item}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type HeldRequisitionsDialogBodyProps = {
  item: DirectInventoryItem
  onClose: () => void
}

// Tách khỏi dialog để `key={item.id}` đặt lại bộ lọc và trang khi mở vật tư khác.
function HeldRequisitionsDialogBody({
  item,
  onClose,
}: HeldRequisitionsDialogBodyProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState<HeldRequisitionsSearch>(INITIAL_SEARCH)

  const heldRequisitionsQuery = useQuery({
    ...heldRequisitionsQueryOptions(item.id, search),
    placeholderData: keepPreviousData,
  })

  // Đổi bộ lọc thì quay về trang 1.
  const handleSearchChange = (patch: Partial<HeldRequisitionsSearch>) =>
    setSearch((prev) => ({ ...prev, ...patch, page: 1 }))

  // Cùng gốc khoá với danh sách tồn: đọc lại cả số Tồn/Đã giữ lẫn bảng này.
  const handleRefresh = () => {
    setSearch(INITIAL_SEARCH)
    void queryClient.invalidateQueries({ queryKey: ["inventory-directs"] })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base tracking-wide uppercase">
          Chi tiết số lượng đã giữ
        </DialogTitle>
        <DialogDescription className="sr-only">
          Các phiếu lĩnh đã duyệt, chưa xuất kho đang giữ vật tư {item.code}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <InventoryDirectInfoCard item={item} />
        <InventoryDirectStockBox item={item} />
      </div>

      <HeldRequisitionsFilter
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
      />

      {heldRequisitionsQuery.isPending ? (
        <TableQueryLoading rows={search.limit} />
      ) : heldRequisitionsQuery.isError ? (
        <TableQueryError
          error={heldRequisitionsQuery.error.message}
          onRetry={() => void heldRequisitionsQuery.refetch()}
        />
      ) : (
        <HeldRequisitionsTable
          heldRequisitions={heldRequisitionsQuery.data}
          unit={item.unit}
          isFetching={heldRequisitionsQuery.isFetching}
          hasFilters={Boolean(search.q ?? search.departmentId ?? search.type)}
          onPageChange={(page) => setSearch((prev) => ({ ...prev, page }))}
        />
      )}

      <DialogFooter className="items-center sm:justify-between">
        <p className="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning-ink">
          Chỉ hiển thị các phiếu lĩnh đã được duyệt và chưa xuất kho. Phiếu đã
          xuất kho, bị từ chối hoặc đã huỷ không còn giữ vật tư.
        </p>
        <Button type="button" variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </DialogFooter>
    </>
  )
}
