import { Image } from "@unpic/react"
import { Link } from "@tanstack/react-router"
import { Eye, Pencil } from "lucide-react"
import type { ReactNode } from "react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

// The edit flow (task 8.2's write side) isn't built yet, so that action stays disabled with a
// tooltip explaining why. The <span tabIndex={0}> wrapper is required: a disabled button
// swallows pointer events and the tooltip would never fire (same idiom as OrderTableCells.tsx's
// DisabledAction — duplicated *there* only, since that's a different feature and a feature may
// only read another feature's data through its api/index.ts barrel, never its components; other
// production-jobs files import this one directly, see ProductionJobBomTab.tsx).
export function DisabledAction({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="pointer-events-none bg-background text-muted-foreground"
            aria-label={label}
            disabled
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{`${label} — chưa được xây dựng`}</TooltipContent>
    </Tooltip>
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
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="bg-background text-muted-foreground"
        aria-label="Xem chi tiết"
        asChild
      >
        <Link
          to="/manage/production-jobs/$productionJobId"
          params={{ productionJobId }}
          search={{ tab: "info" }}
        >
          <Eye className="size-3.5" />
        </Link>
      </Button>
      <DisabledAction label="Chỉnh sửa">
        <Pencil className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
