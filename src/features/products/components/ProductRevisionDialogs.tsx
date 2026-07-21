import { CreateProductRevisionDialog } from "@/features/products/components/CreateProductRevisionDialog"
import { EditProductRevisionDialog } from "@/features/products/components/EditProductRevisionDialog"
import { PromoteRevisionDialog } from "@/features/products/components/PromoteRevisionDialog"
import type { UseProductRevisionsResult } from "@/features/products/hooks/use-product-revisions"

type ProductRevisionDialogsProps = {
  revisions: UseProductRevisionsResult
}

// Bundles the revision dialogs the header and the revisions tab both open
// into — kept out of ProductDetailPage so its JSX doesn't grow with every new
// revision dialog.
export function ProductRevisionDialogs({
  revisions: r,
}: ProductRevisionDialogsProps) {
  const promotingRevision =
    r.revisions.find((revision) => revision.id === r.defaultRevisionId) ?? null
  const editingRevision =
    r.revisions.find((revision) => revision.id === r.editingRevisionId) ?? null

  return (
    <>
      <CreateProductRevisionDialog
        open={r.isCreateOpen}
        onOpenChange={r.setIsCreateOpen}
        revisions={r.revisions}
        activeRevisionId={r.activeRevision.id}
        prefill={r.createPrefill}
        onSubmit={r.createRevision}
        isSubmitting={r.isCreatingRevision}
      />

      <PromoteRevisionDialog
        open={r.defaultRevisionId !== null}
        onOpenChange={(next) => {
          if (!next) r.setDefaultRevisionId(null)
        }}
        revision={promotingRevision}
        currentRevision={r.activeRevision}
        onConfirm={r.confirmPromote}
        isConfirming={r.isPromoting}
      />

      <EditProductRevisionDialog
        open={r.editingRevisionId !== null}
        onOpenChange={(next) => {
          if (!next) r.setEditingRevisionId(null)
        }}
        revision={editingRevision}
        onSubmit={r.submitEdit}
        isSubmitting={r.isUpdatingRevision}
      />
    </>
  )
}
