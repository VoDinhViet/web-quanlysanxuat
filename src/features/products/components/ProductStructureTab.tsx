import { Icon } from "@iconify/react"
import addSquareBold from "@iconify-icons/solar/add-square-bold"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { OperationFormDialog } from "@/features/products/components/OperationFormDialog"
import { ProductStructureLegend } from "@/features/products/components/ProductStructureLegend"
import { ProductStructureTable } from "@/features/products/components/ProductStructureTable"
import { StructureNodeFormDialog } from "@/features/products/components/StructureNodeFormDialog"
import { useProductStructure } from "@/features/products/hooks/use-product-structure"
import type { Product } from "@/features/products/types/product.type"

type ProductStructureTabProps = {
  product: Product
}

// Orchestrates the structure tab: the level legend, the "add root item"
// action, the BOM table itself, and every dialog its rows open into — kept
// out of ProductDetailPage the same way ProductRevisionDialogs is.
export function ProductStructureTab({ product }: ProductStructureTabProps) {
  const structure = useProductStructure()

  return (
    <div className="px-4 py-5 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <ProductStructureLegend />
        <PermissionGate permission="products:update">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => structure.openAddNode(null)}
            className="shrink-0 gap-1.5 text-xs"
          >
            <Icon icon={addSquareBold} className="size-3.5" />
            Thêm hạng mục
          </Button>
        </PermissionGate>
      </div>

      <ProductStructureTable
        product={product}
        nodes={structure.nodes}
        onAddChild={structure.openAddNode}
        onEditNode={structure.openEditNode}
        onDeleteNode={structure.setDeletingNode}
        onAddOperation={structure.openAddOperation}
        onEditOperation={structure.openEditOperation}
        onDeleteOperation={structure.removeOperation}
      />

      <StructureNodeFormDialog
        dialogState={structure.nodeDialog}
        onOpenChange={(open) => {
          if (!open) structure.closeNodeDialog()
        }}
        onSubmit={structure.submitNode}
      />

      <OperationFormDialog
        dialogState={structure.operationDialog}
        onOpenChange={(open) => {
          if (!open) structure.closeOperationDialog()
        }}
        onSubmit={structure.submitOperation}
      />

      <AlertDialog
        open={structure.deletingNode !== null}
        onOpenChange={(open) => {
          if (!open) structure.setDeletingNode(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá hạng mục này?</AlertDialogTitle>
            <AlertDialogDescription>
              {structure.deletingNode
                ? `"${structure.deletingNode.name}" (${structure.deletingNode.code}) và toàn bộ hạng mục con bên trong sẽ bị xoá khỏi cấu trúc sản phẩm.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={structure.confirmDeleteNode}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
