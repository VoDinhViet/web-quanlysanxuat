import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { ImageOff } from "lucide-react"

import { resolveFileUrl } from "@/lib/file-url"
import type { ItemIssue } from "@/lib/types/item.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const col = createColumnHelper<ItemIssue>()

export const itemIssueColumns = [
  col.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
  }),
  col.display({
    id: "material",
    header: "Vật tư",
    meta: { headerClassName: "min-w-64" },
    cell: ({ row }) => {
      const material = row.original
      const imageUrl = material.image
        ? typeof material.image === "string"
          ? resolveFileUrl(material.image)
          : resolveFileUrl(material.image.url)
        : null

      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={material.name}
                layout="fullWidth"
                objectFit="cover"
                className="size-full"
              />
            ) : (
              <ImageOff className="size-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {material.name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {material.code}
            </p>
          </div>
        </div>
      )
    },
  }),
  col.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-20" },
  }),
  col.accessor("requiredQty", {
    header: "Định mức / 1 bộ",
    meta: {
      headerClassName: "min-w-32 text-right",
      cellClassName: "text-right font-medium text-foreground",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
]
