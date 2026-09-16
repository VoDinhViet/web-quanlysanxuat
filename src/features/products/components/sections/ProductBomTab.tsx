import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreateComponentItemDialog } from "@/features/products/components/composites/CreateComponentItemDialog"
import { DeleteBomItemDialog } from "@/features/products/components/composites/DeleteBomItemDialog"
import { ProductBomTable } from "@/features/products/components/composites/ProductBomTable"
import { useProductBom } from "@/features/products/hooks/use-product-bom"
import { itemBomQueryOptions } from "@/features/products/api/options"
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
  // Chỉ có đúng 1 dialog tạo còn lại (tạo COMPONENT từ bảng cây) — vật tư (CONSUMABLE) và
  // sửa hạng mục giờ mở ở trang riêng (BomItemDetailPage), không còn dialog. `createParentId`
  // chỉ có nghĩa khi dialog đang mở — tách riêng khỏi `isCreateOpen` thay vì gộp "đóng"/"tạo ở
  // gốc" vào cùng một sentinel `undefined`/`null`, cùng khuôn với `deletingBomItem` bên dưới.
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createParentId, setCreateParentId] = useState<string | null>(null)
  const [deletingBomItem, setDeletingBomItem] = useState<BomItem | null>(null)

  const bomQuery = useQuery(itemBomQueryOptions(product.id))

  const bom = useProductBom(product.id, {
    onSuccessDelete: () => setDeletingBomItem(null),
  })

  function handleDeleteConfirm() {
    if (deletingBomItem) {
      bom.deleteItem(deletingBomItem.id)
    }
  }

  return (
    <div className="px-4 py-5 sm:px-5">
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
            actions={{
              onCreate: (parentId) => {
                setCreateParentId(parentId)
                setIsCreateOpen(true)
              },
              onDelete: setDeletingBomItem,
            }}
          />
          {/* Small inline hint beneath the BOM tree, not a full-table empty state — too
          small-scale for TableEmpty's icon-badge treatment, intentionally not using it here. */}
          {bomQuery.data.length === 0 ? (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Chưa có thành phần con — nhấn "Thêm thành phần" ở dòng sản phẩm để
              bắt đầu.
            </p>
          ) : null}
        </>
      )}

      <CreateComponentItemDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(value) =>
          bom.createItem(value, createParentId, () => setIsCreateOpen(false))
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
