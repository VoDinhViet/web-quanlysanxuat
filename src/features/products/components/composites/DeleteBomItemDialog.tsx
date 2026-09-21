import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItem } from "@/lib/types/bom-item.type"

const partLabel = bomItemTypeLabels.COMPONENT

type DeleteBomItemDialogProps = {
  bomItem: BomItem | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteBomItemDialog({
  bomItem,
  onOpenChange,
  onConfirm,
}: DeleteBomItemDialogProps) {
  return (
    <AlertDialog open={bomItem !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xoá {partLabel} này?</AlertDialogTitle>
          <AlertDialogDescription>
            {bomItem
              ? `"${bomItem.name}" (${bomItem.code}) và toàn bộ ${partLabel} con bên trong sẽ bị xoá khỏi cấu trúc sản phẩm.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
