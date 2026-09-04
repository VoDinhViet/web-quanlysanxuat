import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { BomItem } from "@/lib/types/bom-item.type"

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
    <AlertDialog isOpen={node !== null} onOpenChange={onOpenChange}>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <Trash2 />
        </AlertDialogMedia>
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
          Xác nhận
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialog>
  )
}
