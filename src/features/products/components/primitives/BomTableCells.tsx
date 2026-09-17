import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"

import { resolveFileUrl } from "@/lib/file-url"
import { formatOperationSequence } from "@/lib/types/operation.type"
import type { BomRow } from "@/features/products/utils/bom-rows.util"

// Cấp badge cho cột CẤP: 0 xanh lá, 1 xanh dương, 2+ hổ phách.
export function BomLevelBadge({ level }: { level: number }) {
  if (level === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
        <span className="size-2 rounded-full bg-emerald-500" />0
      </span>
    )
  }
  if (level === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-400">
        <span className="size-2 rounded-full bg-blue-500" />1
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
      <span className="size-2 rounded-full bg-amber-500" />
      {level}
    </span>
  )
}

// Ảnh + mã/tên dùng chung cho mọi dòng (ROOT, dòng gốc tạm khi BOM rỗng, và
// COMPONENT) — đọc từ view model `BomRow` thay vì `BomItem`, nhờ đó dòng gốc
// tạm (dựng từ `product`) dùng lại đúng component này thay vì tự vẽ riêng.
export function BomCodeCell({ row }: { row: BomRow }) {
  const indent = row.isRoot ? 0 : row.level - 1

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ paddingLeft: `${indent * 16}px` }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
        {row.image ? (
          <Image
            src={resolveFileUrl(row.image.url)}
            alt={row.name}
            layout="fullWidth"
            objectFit="cover"
            className="size-full"
          />
        ) : (
          <Gallery className="size-3.5 text-muted-foreground/50" />
        )}
      </div>
      <span className="font-mono font-bold text-foreground">
        {row.revision ? `${row.code} · ${row.revision}` : row.code}
      </span>
    </div>
  )
}

// Xem nhanh chuỗi công đoạn ngay trong bảng cây, không phải mở trang chi tiết
// mới thấy. Chỉ node COMPONENT có công đoạn (ROOT/dòng gốc tạm không). Đọc
// thẳng từ `row.component.operations` — backend đã join sẵn trong cùng
// response GET .../bom (một query `IN (...)` cho cả cây), không gọi riêng
// `bomItemOperationsQueryOptions` cho từng dòng.
export function BomOperationsCell({ row }: { row: BomRow }) {
  if (row.component === null) {
    return <span className="text-muted-foreground">—</span>
  }

  const sequence = formatOperationSequence(row.component.operations)

  return (
    <span
      className="block truncate text-sm text-muted-foreground"
      title={sequence}
    >
      {sequence}
    </span>
  )
}
