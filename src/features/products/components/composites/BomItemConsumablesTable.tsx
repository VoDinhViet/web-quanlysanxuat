import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Image } from "@unpic/react"
import {
  AddSquare,
  ArrowRightUp,
  BoxMinimalistic,
  CheckCircle,
  CloseCircle,
  Gallery,
  InfoCircle,
  Magnifier,
  Pen,
  TrashBinTrash,
} from "@solar-icons/react"
import { useDebounceValue } from "usehooks-ts"

import { Button, LinkButton } from "@/components/ui/button"
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
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { CreateConsumableDialog } from "@/features/products/components/composites/CreateConsumableDialog"
import { bomItemConsumablesQueryOptions } from "@/features/products/api/options"
import type { UseProductBomResult } from "@/features/products/hooks/use-product-bom"
import type { BomItem } from "@/lib/types/bom-item.type"
import { resolveFileUrl } from "@/lib/file-url"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
// Bảng nhỏ trong trang, không có selector đổi cỡ trang (Pagination ẩn selector khi bỏ qua
// `onPageSizeChange`) — cỡ trang cố định.
const PAGE_SIZE = 10

type BomItemConsumablesTableProps = {
  productId: string
  bomItem: BomItem
  // false khi bomItem còn cấu trúc con (COMPONENT) bên dưới — chỉ cấp cuối cùng
  // (không còn con) mới được gắn vật tư trực tiếp, để tránh vật tư nằm rải
  // rác giữa các cấp làm sai lệch cách nổ (explode) nhu cầu vật tư theo cây.
  canCreateConsumables: boolean
  bom: UseProductBomResult
}

// Vật tư con trực tiếp của một BomItem (ROOT hoặc COMPONENT) — bảng bên trong tab
// "Vật tư" của BomItemDetailPage, tách hẳn khỏi cây cấu trúc chính (ProductBomTable
// không còn hiển thị dòng CONSUMABLE nào nữa). Đọc qua bomItemConsumablesQueryOptions
// (phân trang/tìm kiếm thật ở BE) thay vì lọc client-side từ cây đầy đủ đã tải —
// cây có thể có nhiều node, nhưng bảng này chỉ cần đúng phần con trực tiếp của một
// node. Thêm vật tư qua CreateConsumableDialog (cùng khuôn với
// CreateComponentItemDialog). Sửa không mở dòng/form riêng — bấm "Sửa" chỉ mở khoá 2
// ô Số lượng/Ghi chú ngay tại đúng vị trí của chúng trên dòng đang có, dòng vẫn là
// chính nó, không đổi hình dạng. sortOrder không sửa được ở đây (không có cột riêng)
// — cùng lý do BomItemInfoTab.tsx đã bỏ ô này. Xoá không cần xác nhận, cùng lý do và
// cùng tiền lệ với "Xoá công đoạn" ở ProductOperationsPanel — rủi ro thấp, dễ thêm
// lại nếu lỡ tay.
export function BomItemConsumablesTable({
  productId,
  bomItem,
  canCreateConsumables,
  bom,
}: BomItemConsumablesTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingConsumableId, setEditingConsumableId] = useState<string | null>(
    null
  )
  const [draftQuantity, setDraftQuantity] = useState<number | undefined>(
    undefined
  )
  const [draftNote, setDraftNote] = useState("")
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)
  const [page, setPage] = useState(1)
  const columnCount = 6

  const query = useQuery({
    ...bomItemConsumablesQueryOptions(productId, bomItem.id, {
      page,
      limit: PAGE_SIZE,
      q: debouncedQ.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
  })
  const consumables = query.data?.data ?? []
  const pagination = query.data?.pagination

  function startEditing(
    consumableId: string,
    quantity: number,
    note: string | null
  ) {
    setEditingConsumableId(consumableId)
    setDraftQuantity(quantity)
    setDraftNote(note ?? "")
  }

  function saveEditing(consumableId: string) {
    if (draftQuantity === undefined || draftQuantity <= 0) return
    bom.updateItem(
      { quantity: draftQuantity, note: draftNote },
      consumableId,
      () => setEditingConsumableId(null)
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm theo mã hoặc tên..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              setPage(1)
            }}
          />
          <Magnifier className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <PermissionGate permission="items:bom-manage">
          {canCreateConsumables && (
            <Button
              type="button"
              className="shrink-0 gap-1.5"
              onClick={() => setIsCreateOpen(true)}
            >
              <AddSquare className="size-3.5" />
              Thêm vật tư
            </Button>
          )}
        </PermissionGate>
      </div>

      {!canCreateConsumables && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <InfoCircle className="mt-0.5 size-3.5 shrink-0" />
          Còn cấu trúc con bên dưới nên không gắn vật tư trực tiếp ở đây — chỉ
          cấp cuối cùng (không còn con) mới thêm được vật tư.
        </p>
      )}

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Danh sách vật tư">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              <TableHead className="w-14">STT</TableHead>
              <TableHead>VẬT TƯ</TableHead>
              <TableHead className="w-20">ĐVT</TableHead>
              <TableHead className="w-28 text-center">SỐ LƯỢNG</TableHead>
              <TableHead className="min-w-40">GHI CHÚ</TableHead>
              <TableHead className="min-w-52 text-right">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <TableEmpty
                    icon={BoxMinimalistic}
                    colSpan={columnCount}
                    title={
                      query.isPending
                        ? "Đang tải..."
                        : q
                          ? "Không tìm thấy kết quả"
                          : "Chưa có vật tư nào"
                    }
                    description={
                      !query.isPending && q
                        ? "Thử một từ khoá khác hoặc kiểm tra lại chính tả."
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              consumables.map((consumable, idx) => {
                const isEditing = editingConsumableId === consumable.id

                return (
                  <TableRow
                    key={consumable.id}
                    id={consumable.id}
                    className="h-14"
                  >
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                          {consumable.image ? (
                            <Image
                              src={resolveFileUrl(consumable.image.url)}
                              alt={consumable.name}
                              layout="fullWidth"
                              objectFit="cover"
                              className="size-full"
                            />
                          ) : (
                            <Gallery className="size-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-foreground">
                            {consumable.code}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {consumable.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {consumable.unit ? (
                        <span title={consumable.unit.code}>
                          {consumable.unit.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <NumericCellInput
                          value={draftQuantity}
                          onValueChange={setDraftQuantity}
                          disabled={bom.isSaving}
                        />
                      ) : (
                        <span className="font-semibold text-foreground tabular-nums">
                          {quantityFormatter.format(consumable.quantity)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TableTextCellInput
                          value={draftNote}
                          onValueChange={setDraftNote}
                          placeholder="Ghi chú (nếu có)..."
                          disabled={bom.isSaving}
                        />
                      ) : (
                        <span className="truncate text-xs text-muted-foreground">
                          {consumable.note || "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-3">
                        <LinkButton
                          to="/manage/consumables/$consumableId/update"
                          params={{ consumableId: consumable.itemId }}
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <ArrowRightUp className="size-3.5" />
                          Xem
                        </LinkButton>
                        <PermissionGate permission="items:bom-manage">
                          {isEditing ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => setEditingConsumableId(null)}
                                disabled={bom.isSaving}
                              >
                                <CloseCircle className="size-3.5" />
                                Hủy
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-primary hover:text-primary"
                                disabled={
                                  bom.isSaving ||
                                  draftQuantity === undefined ||
                                  draftQuantity <= 0
                                }
                                onClick={() => saveEditing(consumable.id)}
                              >
                                <CheckCircle className="size-3.5" />
                                Lưu
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  startEditing(
                                    consumable.id,
                                    consumable.quantity,
                                    consumable.note
                                  )
                                }
                              >
                                <Pen className="size-3.5" />
                                Sửa
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                                onClick={() => bom.deleteItem(consumable.id)}
                              >
                                <TrashBinTrash className="size-3.5" />
                                Xoá
                              </Button>
                            </>
                          )}
                        </PermissionGate>
                      </div>
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
        />
      )}

      <CreateConsumableDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) =>
          bom.createItems(
            values.map((value) => ({ ...value, parentId: bomItem.id })),
            () => setIsCreateOpen(false)
          )
        }
        isSaving={bom.isSaving}
      />
    </div>
  )
}
