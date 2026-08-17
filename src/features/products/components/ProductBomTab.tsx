import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { BomItemFormDialog } from "@/features/products/components/BomItemFormDialog"
import { DeleteBomItemDialog } from "@/features/products/components/DeleteBomItemDialog"
import { ProductBomTable } from "@/features/products/components/ProductBomTable"
import { useProductBom } from "@/features/products/hooks/use-product-bom"
import {
  itemBomQueryOptions,
  itemOperationsQueryOptions,
} from "@/features/products/api/options"
import type { Item } from "@/lib/types/item.type"
import type { BomItem, BomItemDialogState } from "@/lib/types/bom-item.type"

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
  const [dialog, setDialog] = useState<BomItemDialogState>({ mode: "closed" })
  const [deletingNode, setDeletingNode] = useState<BomItem | null>(null)

  const closeDialog = () => setDialog({ mode: "closed" })

  const bomQuery = useQuery(itemBomQueryOptions(product.id))
  const operationsQuery = useQuery(itemOperationsQueryOptions(product.id))

  const { createItem, updateItem, deleteItem, isSaving } = useProductBom(
    product.id,
    {
      onSuccessCreate: closeDialog,
      onSuccessUpdate: closeDialog,
      onSuccessDelete: () => setDeletingNode(null),
    }
  )

  function openCreate(parentId: string | null) {
    setDialog({ mode: "create", parentId })
  }

  function openUpdate(node: BomItem) {
    setDialog({ mode: "update", node })
  }

  function handleDeleteConfirm() {
    if (deletingNode) {
      deleteItem(deletingNode.id)
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
              onCreate: openCreate,
              onUpdate: openUpdate,
              onDelete: setDeletingNode,
            }}
            rootOperations={{
              operations: operationsQuery.data ?? [],
              isPending: operationsQuery.isPending,
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

      <BomItemFormDialog
        dialog={dialog}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        onCreate={createItem}
        onUpdate={updateItem}
        isSaving={isSaving}
      />

      <DeleteBomItemDialog
        node={deletingNode}
        onOpenChange={(open) => {
          if (!open) setDeletingNode(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
