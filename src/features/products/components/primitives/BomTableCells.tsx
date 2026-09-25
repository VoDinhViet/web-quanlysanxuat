import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"

import { resolveFileUrl } from "@/lib/file-url"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import { formatOperationSequence } from "@/lib/types/operation.type"
import type {
  BomTree,
  TreeGuideType,
} from "@/features/products/utils/bom-tree"

// Thước kẻ phân nhánh cây BOM (h-14 khớp đúng chiều cao hàng bảng, nối liền mạch giữa các dòng)
export function TreeGuideLine({ type }: { type: TreeGuideType }) {
  if (type === "blank") {
    return <div className="w-5 shrink-0" aria-hidden="true" />
  }

  return (
    <svg
      className="h-14 w-5 shrink-0 text-border"
      viewBox="0 0 20 56"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {type === "vertical" && (
        <line x1="10" y1="0" x2="10" y2="56" strokeWidth="1.5" />
      )}
      {type === "tee" && (
        <>
          <line x1="10" y1="0" x2="10" y2="56" strokeWidth="1.5" />
          <path d="M10 28h10" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {type === "corner" && (
        <path
          d="M10 0v20a8 8 0 0 0 8 8h2"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

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

// Ảnh + mã/tên — có thước kẻ phân nhánh cây hiển thị quan hệ cha-con trực quan, các chi tiết giữ đơn giản
export function BomCodeCell({ row }: { row: BomTree }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {/* Thước kẻ nhánh cây phân cấp cha-con */}
      {row.treeGuides && row.treeGuides.length > 0 && (
        <div className="flex items-center shrink-0 self-stretch -my-2 mr-0.5">
          {row.treeGuides.map((type, idx) => (
            <TreeGuideLine key={idx} type={type} />
          ))}
        </div>
      )}

      {/* Ảnh đại diện */}
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

      {/* Mã bản vẽ */}
      <span className="font-mono font-bold text-foreground truncate">
        {row.revision ? `${row.code} · ${row.revision}` : row.code}
      </span>

      {/* Badge vật tư */}
      {row.bomItem?.isOffStructure && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
          {bomItemTypeLabels.DIRECT}
        </span>
      )}
    </div>
  )
}

// Xem nhanh chuỗi công đoạn ngay trong bảng cây
export function BomOperationsCell({ row }: { row: BomTree }) {
  const sequence = formatOperationSequence(row.operations)

  return (
    <span
      className="block truncate text-sm text-muted-foreground"
      title={sequence}
    >
      {sequence}
    </span>
  )
}
