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
import type { ProductRevision } from "@/features/products/types/product-revision.type"

type PromoteRevisionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  revision: ProductRevision | null
  currentRevision: ProductRevision
  onConfirm: () => void
  isConfirming?: boolean
}

// A non-destructive but consequential switch (which revision drives
// production), so it gets the same confirm pattern as a delete — just without
// the destructive styling.
export function PromoteRevisionDialog({
  open,
  onOpenChange,
  revision,
  currentRevision,
  onConfirm,
  isConfirming,
}: PromoteRevisionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt làm bản hiện hành?</AlertDialogTitle>
          <AlertDialogDescription>
            {revision
              ? `"${revision.revisionNo}" sẽ trở thành bản hiện hành. Bản "${currentRevision.revisionNo}" hiện tại sẽ chuyển thành Cũ.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={isConfirming}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            Đặt hiện hành
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
