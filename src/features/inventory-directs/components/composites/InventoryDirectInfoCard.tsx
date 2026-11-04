import { useState } from "react"
import { Box } from "@solar-icons/react"

import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"
import type { DirectInventoryItem } from "@/lib/types/inventory-direct.type"
import { cn } from "@/lib/utils"

type InventoryDirectInfoCardProps = {
  item: DirectInventoryItem
}

// Ảnh và các dòng "nhãn : giá trị" của vật tư đang xem chi tiết số lượng giữ.
export function InventoryDirectInfoCard({
  item,
}: InventoryDirectInfoCardProps) {
  const infoRows = [
    { label: "Mã vật tư", value: item.code, isCode: true },
    { label: "Tên vật tư", value: item.name },
    { label: "ĐVT", value: item.unit.name },
    { label: "Nhóm vật tư", value: item.itemCategory?.name ?? "—" },
    { label: "Nhà cung cấp", value: item.supplier?.name ?? "—" },
  ]

  return (
    <div className="flex min-w-0 items-start gap-4 sm:gap-5">
      <ItemThumbnail image={item.image} name={item.name} />

      <dl className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
        {infoRows.map((infoRow) => (
          <div key={infoRow.label} className="flex min-w-0 gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">
              {infoRow.label}
            </dt>
            <span className="text-muted-foreground">:</span>
            <dd
              className={cn(
                "min-w-0 font-medium text-foreground",
                infoRow.isCode && "font-mono font-semibold text-primary"
              )}
            >
              {infoRow.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

type ItemThumbnailProps = {
  image: Pick<FileResource, "url"> | null
  name: string
}

// Ảnh lỗi thì rơi về icon. Trạng thái `isBroken` đặt lại ngay lúc render khi đổi ảnh thay vì
// trong effect (React Compiler chặn setState đồng bộ trong effect).
function ItemThumbnail({ image, name }: ItemThumbnailProps) {
  const [isBroken, setIsBroken] = useState(false)
  const [prevImageUrl, setPrevImageUrl] = useState(image?.url)
  if (image?.url !== prevImageUrl) {
    setPrevImageUrl(image?.url)
    setIsBroken(false)
  }

  if (!image || isBroken) {
    return (
      <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Box className="size-10" />
      </div>
    )
  }

  return (
    <div className="size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
      <img
        src={resolveFileUrl(image.url)}
        alt={name}
        className="size-full object-cover"
        onError={() => setIsBroken(true)}
      />
    </div>
  )
}
