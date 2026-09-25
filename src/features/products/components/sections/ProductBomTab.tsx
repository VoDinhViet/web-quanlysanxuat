import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreateDirectDialog } from "@/features/products/components/composites/CreateDirectDialog"
import { CreateComponentItemDialog } from "@/features/products/components/composites/CreateComponentItemDialog"
import { DeleteBomItemDialog } from "@/features/products/components/composites/DeleteBomItemDialog"
import { ProductBomTable } from "@/features/products/components/composites/ProductBomTable"
import type { BomTableActions } from "@/features/products/components/primitives/BomRowActions"
import { useProductBom } from "@/features/products/hooks/use-product-bom"
import {
  itemBomQueryOptions,
  itemOperationsQueryOptions,
} from "@/features/products/api/options"
import type { BomCreateOptions } from "@/features/products/utils/bom-rows.util"
import type { Item } from "@/lib/types/item.type"
import type { BomItem } from "@/lib/types/bom-item.type"

type ProductBomTabProps = {
  product: Item
}

// Centered wrapper for the tab's error state.
function BomTabMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {children}
    </div>
  )
}

export function ProductBomTab({ product }: ProductBomTabProps) {
  // Chỉ có đúng 1 dialog tạo còn lại (tạo COMPONENT từ bảng cây) — vật tư (DIRECT) và
  // sửa hạng mục giờ mở ở trang riêng (BomItemDetailPage), không còn dialog. `createOptions`
  // chỉ có nghĩa khi dialog đang mở — tách riêng khỏi `isCreateOpen` thay vì gộp "đóng"/"tạo ở
  // gốc" vào cùng một sentinel `undefined`/`null`, cùng khuôn với `deletingBomItem` bên dưới.
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createOptions, setCreateOptions] = useState<BomCreateOptions>({
    childTarget: { parentId: null, parentLabel: null },
    siblingTarget: null,
  })
  const [deletingBomItem, setDeletingBomItem] = useState<BomItem | null>(null)
  // Dialog thêm vật tư ngoài: `undefined` = chưa mở; `{ bomItemId }` với `bomItemId` undefined = gắn
  // sản phẩm chính (Cấp 0), ngược lại là part.
  const [extraOwner, setExtraOwner] = useState<
    { bomItemId: string | undefined } | undefined
  >()

  const bomQuery = useQuery(itemBomQueryOptions(product.id))
  // Công đoạn Cấp 0 — không nằm trong `bomQuery` nữa (docs/decisions/
  // level-0-outside-bom-tree-response.md), đọc riêng qua route `items/:itemId/operations`.
  const rootOperationsQuery = useQuery(itemOperationsQueryOptions(product.id))

  const bom = useProductBom(product.id, {
    onSuccessDelete: () => setDeletingBomItem(null),
  })

  const handleCreate = useCallback((options: BomCreateOptions) => {
    setCreateOptions(options)
    setIsCreateOpen(true)
  }, [])

  // `actions` phải ổn định tham chiếu — ProductBomTable memoize cột theo nó,
  // một object literal mới mỗi render sẽ vô hiệu hoá memo đó.
  const actions = useMemo<BomTableActions>(
    () => ({
      onCreate: handleCreate,
      onDelete: setDeletingBomItem,
      onCreateExtra: (bomItemId) => setExtraOwner({ bomItemId }),
    }),
    [handleCreate]
  )

  function handleDeleteConfirm() {
    if (deletingBomItem) {
      bom.deleteItem(deletingBomItem.id)
    }
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-5">
      {bomQuery.isPending ? (
        <TableQueryLoading rows={6} />
      ) : bomQuery.isError ? (
        <BomTabMessage>
          <p className="max-w-md text-sm font-medium text-muted-foreground">
            {bomQuery.error.message}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void bomQuery.refetch()}
          >
            Thử lại
          </Button>
        </BomTabMessage>
      ) : (
        <>
          <ProductBomTable
            product={product}
            nodes={bomQuery.data}
            rootOperations={rootOperationsQuery.data ?? []}
            routingOperationsPending={rootOperationsQuery.isPending}
            actions={actions}
          />
          {/* Small inline hint beneath the BOM tree, not a full-table empty state — too
          small-scale for TableEmpty's icon-badge treatment, intentionally not using it here. */}
          {bomQuery.data.length === 0 ? (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Chưa có thành phần con — nhấn "Thêm Part" ở dòng sản phẩm để bắt
              đầu.
            </p>
          ) : null}
        </>
      )}

      <CreateComponentItemDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        childTarget={createOptions.childTarget}
        siblingTarget={createOptions.siblingTarget}
        onSubmit={(value, target) =>
          bom.createItem(value, target.parentId, () => setIsCreateOpen(false))
        }
        isSaving={bom.isSaving}
      />

      <CreateDirectDialog
        open={extraOwner !== undefined}
        onOpenChange={(open) => {
          if (!open) setExtraOwner(undefined)
        }}
        onSubmit={(values) =>
          bom.createItems(
            values.map((value) => ({
              ...value,
              parentId: extraOwner?.bomItemId ?? null,
              isOffStructure: true,
            })),
            () => setExtraOwner(undefined)
          )
        }
        isSaving={bom.isSaving}
      />

      <DeleteBomItemDialog
        bomItem={deletingBomItem}
        onOpenChange={(open) => {
          if (!open) setDeletingBomItem(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
