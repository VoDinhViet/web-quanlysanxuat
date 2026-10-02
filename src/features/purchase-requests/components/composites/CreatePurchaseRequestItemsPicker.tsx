import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Magnifier } from "@solar-icons/react"
import { useDebounceValue } from "usehooks-ts"

import { Checkbox } from "@/components/ui/checkbox"
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
import { directsQueryOptions } from "@/features/directs/api"
import { PurchaseRequestItemImageCell } from "@/features/purchase-requests/components/primitives/PurchaseRequestItemCells"
import { ItemStatus } from "@/lib/types/item.type"
import { cn } from "@/lib/utils"
import type { Direct } from "@/lib/types/direct.type"

const PAGE_SIZE = 6

type CreatePurchaseRequestItemsPickerProps = {
  pickedIds: Set<string>
  existingItemIds: Set<string>
  disabled: boolean
  onToggleRow: (direct: Direct) => void
}

// Vật tư chọn thêm: tìm theo mã/tên, chỉ vật tư đang sử dụng; vật tư đã có trong phiếu bị khoá
// (muốn đổi số lượng thì sửa dòng hiện có).
export function CreatePurchaseRequestItemsPicker({
  pickedIds,
  existingItemIds,
  disabled,
  onToggleRow,
}: CreatePurchaseRequestItemsPickerProps) {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  const directsQuery = useQuery({
    ...directsQueryOptions({
      page,
      limit: PAGE_SIZE,
      q: debouncedQ.trim() || undefined,
      status: ItemStatus.ACTIVE,
    }),
    placeholderData: keepPreviousData,
  })

  const rows = directsQuery.data?.data ?? []
  const pagination = directsQuery.data?.pagination

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          aria-label="Tìm vật tư"
          className="pr-9 text-xs placeholder:text-muted-foreground/75"
          placeholder="Tìm theo mã, tên vật tư..."
          value={q}
          disabled={disabled}
          onChange={(event) => {
            setQ(event.target.value)
            setPage(1)
          }}
        />
        <Magnifier className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Danh mục vật tư">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-14 text-center">Ảnh</TableHead>
              <TableHead className="min-w-56">Vật tư</TableHead>
              <TableHead className="w-20">ĐVT</TableHead>
              <TableHead className="w-28">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <TableEmpty
                    colSpan={5}
                    title={
                      directsQuery.isPending
                        ? "Đang tải..."
                        : "Không tìm thấy vật tư nào"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((direct) => {
                const isExisting = existingItemIds.has(direct.id)
                const isPicked = pickedIds.has(direct.id)

                return (
                  <TableRow
                    key={direct.id}
                    className={cn(
                      "h-14 bg-card hover:bg-muted/25",
                      isPicked && "bg-primary/5",
                      isExisting && "opacity-60"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isPicked}
                        disabled={disabled || isExisting}
                        onCheckedChange={() => onToggleRow(direct)}
                        aria-label={`Chọn ${direct.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <PurchaseRequestItemImageCell
                        image={direct.image}
                        name={direct.name}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-foreground">
                        {direct.name}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {direct.code}
                      </p>
                    </TableCell>
                    <TableCell>{direct.unit.name}</TableCell>
                    <TableCell>
                      {isExisting && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Đã có trong phiếu
                        </span>
                      )}
                    </TableCell>
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
          disabled={disabled}
        />
      )}
    </div>
  )
}
