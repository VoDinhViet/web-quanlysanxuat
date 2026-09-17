import { Image } from "@unpic/react"
import { Gallery, TrashBinTrash } from "@solar-icons/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { resolveFileUrl } from "@/lib/file-url"
import type { ConsumablePickerRow } from "@/features/products/components/composites/ConsumablePickerColumns"

export type ConsumableDraftItem = {
  row: ConsumablePickerRow
  quantity: number | undefined
  note: string
}

type CreateConsumableDetailsTableProps = {
  items: ConsumableDraftItem[]
  disabled: boolean
  onQuantityChange: (itemId: string, quantity: number | undefined) => void
  onNoteChange: (itemId: string, note: string) => void
  onRemove: (itemId: string) => void
}

// Bước 2 (nhập số lượng & ghi chú) — danh sách phẳng đúng các dòng đã chọn ở bước 1, không phân
// trang/tìm kiếm (đã là tập con nhỏ). Cho bỏ chọn ngay tại đây (nút xoá cuối dòng) thay vì bắt
// quay lại bước 1 mới đổi được lựa chọn.
export function CreateConsumableDetailsTable({
  items,
  disabled,
  onQuantityChange,
  onNoteChange,
  onRemove,
}: CreateConsumableDetailsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table aria-label="Số lượng và ghi chú vật tư đã chọn">
        <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
          <TableRow>
            <TableHead className="min-w-40">Mã / Tên</TableHead>
            <TableHead className="w-28">Số lượng</TableHead>
            <TableHead className="min-w-36">Ghi chú</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.row.id}
              className="h-14 bg-card hover:bg-muted/25"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                    {item.row.image ? (
                      <Image
                        src={resolveFileUrl(item.row.image.url)}
                        alt={item.row.name}
                        layout="fullWidth"
                        objectFit="cover"
                        className="size-full"
                      />
                    ) : (
                      <Gallery className="size-3 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-foreground">
                      {item.row.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.row.name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <NumericCellInput
                  value={item.quantity}
                  disabled={disabled}
                  onValueChange={(value) =>
                    onQuantityChange(item.row.id, value)
                  }
                />
              </TableCell>
              <TableCell>
                <TableTextCellInput
                  placeholder="Ghi chú (nếu có)..."
                  value={item.note}
                  disabled={disabled}
                  onValueChange={(value) => onNoteChange(item.row.id, value)}
                />
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Bỏ chọn ${item.row.name}`}
                        className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        disabled={disabled}
                        onClick={() => onRemove(item.row.id)}
                      >
                        <TrashBinTrash className="size-3.5" />
                      </Button>
                    }
                  />
                  <TooltipContent>Bỏ chọn</TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
