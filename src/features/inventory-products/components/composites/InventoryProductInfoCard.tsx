import { Hashtag, Notes, Ruler, User } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import type { Item } from "@/lib/types/item.type"

type InventoryProductInfoCardProps = {
  item: Item
}

// The facts grid (Mã/ĐVT/Khách hàng/Ghi chú), plain (no card fill) — sits beside
// InventoryProductStatTiles.tsx's tinted stock-overview card, which stays tinted since it's the
// one panel worth visually calling out. Deliberately no "Màu / Bề mặt" or "Tiêu chuẩn" rows —
// confirmed RM-only fields (Material.colorSurface/technicalStandard) that don't exist on a
// finished-goods Item.
export function InventoryProductInfoCard({
  item,
}: InventoryProductInfoCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Thông tin thành phẩm
      </p>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <InfoField
          icon={Hashtag}
          label="Mã thành phẩm"
          value={item.code}
          mono
        />
        <InfoField icon={Ruler} label="Đơn vị tính" value={item.unit.name} />
        <InfoField
          icon={User}
          label="Khách hàng"
          value={item.client?.name ?? "—"}
        />
        <InfoField icon={Notes} label="Ghi chú" value={item.note ?? "—"} />
      </dl>
    </div>
  )
}

type InfoFieldProps = {
  icon: ComponentType<IconProps>
  label: string
  value: string
  mono?: boolean
}

function InfoField({ icon: Icon, label, value, mono }: InfoFieldProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd
          className={
            mono
              ? "mt-0.5 truncate font-mono text-sm font-semibold text-foreground"
              : "mt-0.5 truncate text-sm font-semibold text-foreground"
          }
        >
          {value}
        </dd>
      </div>
    </div>
  )
}
