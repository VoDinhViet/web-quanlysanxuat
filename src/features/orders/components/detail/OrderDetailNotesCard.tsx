import { Icon } from "@iconify/react"
import lockKeyholeBold from "@iconify-icons/solar/lock-keyhole-bold"
import notesBold from "@iconify-icons/solar/notes-bold"
import type { IconifyIcon } from "@iconify/types"
import type { ReactNode } from "react"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailNotesCardProps = {
  order: OrderDetail
}

export function OrderDetailNotesCard({ order }: OrderDetailNotesCardProps) {
  return (
    <OrderDetailSectionCard icon={notesBold} title="Ghi chú">
      <div className="space-y-5">
        <NoteBlock icon={notesBold} title="Ghi chú">
          <p className="text-sm text-foreground">
            {order.note || "Chưa có ghi chú"}
          </p>
        </NoteBlock>

        <NoteBlock icon={lockKeyholeBold} title="Ghi chú nội bộ">
          <p className="text-sm text-foreground">
            {order.internalNote || "Chưa có ghi chú nội bộ"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Không hiển thị cho khách hàng.
          </p>
        </NoteBlock>
      </div>
    </OrderDetailSectionCard>
  )
}

type NoteBlockProps = {
  icon: IconifyIcon
  title: string
  children: ReactNode
}

function NoteBlock({ icon, title, children }: NoteBlockProps) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon icon={icon} className="size-3.5" />
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}
