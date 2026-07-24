import { useMemo } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { BomItemFormDialog } from "@/features/products/components/BomItemFormDialog"
import { DeleteBomItemDialog } from "@/features/products/components/DeleteBomItemDialog"
import { ProductBomTable } from "@/features/products/components/ProductBomTable"
import { useProductBom } from "@/features/products/hooks/use-product-bom"
import { productBomQueryOptions } from "@/features/products/queries/product-bom.query"
import { productOperationsQueryOptions } from "@/features/products/queries/product-operations.query"
import type { OperationsByProductId } from "@/features/products/components/ProductBomTable"
import type { BomItem } from "@/features/products/types/bom-item.type"
import type { Product } from "@/features/products/types/product.type"

type ProductBomTabProps = {
  product: Product
}

// Every "Sản phẩm"-type BOM line is itself a product with its own routing
// (GET /api/products/:itemId/operations) — collect all of them, at every
// depth, so their routing can be fetched alongside the current product's own.
function collectProductItemIds(nodes: BomItem[]): string[] {
  const ids: string[] = []

  function visit(list: BomItem[]) {
    list.forEach((node) => {
      if (node.itemType === "PRODUCT") ids.push(node.itemId)
      if (node.children.length > 0) visit(node.children)
    })
  }

  visit(nodes)
  return ids
}

// Centered wrapper for the tab's loading / error states.
function BomTabMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {children}
    </div>
  )
}

export function ProductBomTab({ product }: ProductBomTabProps) {
  const bomQuery = useQuery(productBomQueryOptions(product.id))
  const bom = useProductBom(product.id)

  const operationsQuery = useQuery(productOperationsQueryOptions(product.id))

  const childProductIds = useMemo(
    () => collectProductItemIds(bomQuery.data ?? []),
    [bomQuery.data]
  )
  const childOperationsQueries = useQueries({
    queries: childProductIds.map((id) => productOperationsQueryOptions(id)),
  })
  const operationsByProductId = useMemo(() => {
    const map: OperationsByProductId = {
      [product.id]: {
        operations: operationsQuery.data ?? [],
        isPending: operationsQuery.isPending,
      },
    }
    childProductIds.forEach((id, index) => {
      const result = childOperationsQueries[index]
      map[id] = {
        operations: result.data ?? [],
        isPending: result.isPending,
      }
    })
    return map
  }, [
    product.id,
    operationsQuery.data,
    operationsQuery.isPending,
    childProductIds,
    childOperationsQueries,
  ])

  return (
    <div className="px-4 py-5 sm:px-5">
      {bomQuery.isPending ? (
        <BomTabMessage>
          <Spinner className="size-8" />
        </BomTabMessage>
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
              onCreate: bom.openCreate,
              onUpdate: bom.openUpdate,
              onDelete: bom.setDeletingNode,
            }}
            operationsByProductId={operationsByProductId}
          />
          {bomQuery.data.length === 0 ? (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Chưa có thành phần con — nhấn "Thêm thành phần" ở dòng sản phẩm để
              bắt đầu.
            </p>
          ) : null}
        </>
      )}

      <BomItemFormDialog
        dialog={bom.dialog}
        onOpenChange={(open) => {
          if (!open) bom.closeDialog()
        }}
        onCreate={bom.createItem}
        onUpdate={bom.updateItem}
        isSaving={bom.isSaving}
      />

      <DeleteBomItemDialog
        node={bom.deletingNode}
        onOpenChange={(open) => {
          if (!open) bom.setDeletingNode(null)
        }}
        onConfirm={bom.deleteItem}
      />
    </div>
  )
}
