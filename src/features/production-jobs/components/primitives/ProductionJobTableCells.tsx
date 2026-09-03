import { Image } from "@unpic/react"
import { Link } from "@tanstack/react-router"
import { Gallery } from "@solar-icons/react"
import { Eye, Pencil } from "lucide-react"

import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { IconButton } from "@/components/shared/primitives/IconButton"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"

// `image` is the product's image, already resolved server-side (ProductionJobResDto.image) — the
// list row no longer carries a `product` object to read it off (see production-job.type.ts), so
// there's no product name for `alt` either; a generic label is the accepted cost. Cùng khuôn
// image-cell mọi bảng khác dùng (ProductsTableColumns.tsx/MaterialsTableColumns.tsx/...) —
// `border border-border/60` quanh ô mới đúng, thiếu viền làm ô trống nhìn như lỗi hiển thị.
export function ProductImageCell({ image }: { image: FileResource | null }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
      {image ? (
        <Image
          src={resolveFileUrl(image.url)}
          alt="Ảnh sản phẩm"
          layout="fullWidth"
          objectFit="cover"
          className="size-full"
        />
      ) : (
        <Gallery className="size-4 text-muted-foreground/50" />
      )}
    </div>
  )
}

type ProductionJobActionsCellProps = {
  productionJobId: string
}

export function ProductionJobActionsCell({
  productionJobId,
}: ProductionJobActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton
        label="Xem chi tiết"
        className="bg-background text-muted-foreground"
        asChild
      >
        <Link
          to="/manage/production-jobs/$productionJobId"
          params={{ productionJobId }}
          search={{ tab: "info" }}
        >
          <Eye className="size-3.5" />
        </Link>
      </IconButton>
      <DisabledAction label="Chỉnh sửa" hint="chưa được xây dựng">
        <Pencil className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
