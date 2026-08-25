import { Image } from "@unpic/react"
import { Link } from "@tanstack/react-router"
import { Eye, Pencil } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import { IconButton } from "@/components/shared/buttons/IconButton"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"

// `image` is the product's image, already resolved server-side (ProductionJobResDto.image) — the
// list row no longer carries a `product` object to read it off (see production-job.type.ts), so
// there's no product name for `alt` either; a generic label is the accepted cost.
export function ProductImageCell({ image }: { image: FileResource | null }) {
  return (
    <AspectRatio
      ratio={1}
      className="size-9 shrink-0 overflow-hidden rounded-lg bg-muted/40"
    >
      {image ? (
        <Image
          src={resolveFileUrl(image.url)}
          alt="Ảnh sản phẩm"
          layout="fullWidth"
          objectFit="cover"
          className="size-full"
        />
      ) : (
        <img
          src="/empty-image.svg"
          alt=""
          className="size-full object-contain p-2"
        />
      )}
    </AspectRatio>
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
