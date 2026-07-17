import { AspectRatio } from "web-qlsx-start"

export const Ratios = () => (
  <div className="grid w-full max-w-lg grid-cols-2 gap-4">
    <AspectRatio
      ratio={16 / 9}
      className="flex items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground"
    >
      16 : 9 — Ảnh sản phẩm
    </AspectRatio>
    <AspectRatio
      ratio={1}
      className="flex items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground"
    >
      1 : 1 — Ảnh đại diện
    </AspectRatio>
  </div>
)
