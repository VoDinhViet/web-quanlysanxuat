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
import type { BomItem } from "@/features/products/types/bom-item.type"

type DeleteBomItemDialogProps = {
  node: BomItem | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteBomItemDialog({
  node,
  onOpenChange,
  onConfirm,
}: DeleteBomItemDialogProps) {
  return (
    <AlertDialog open={node !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá thành phần này?</AlertDialogTitle>
          <AlertDialogDescription>
            {node
              ? `"${node.name}" (${node.code}) và toàn bộ thành phần con bên trong sẽ bị xoá khỏi cấu trúc sản phẩm.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Xoá
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
