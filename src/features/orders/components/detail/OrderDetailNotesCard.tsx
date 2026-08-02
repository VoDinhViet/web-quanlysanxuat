import { LockKeyhole, Notes } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailNotesCardProps = {
  order: OrderDetail
}

export function OrderDetailNotesCard({ order }: OrderDetailNotesCardProps) {
  return (
    <OrderDetailSectionCard icon={Notes} title="Ghi chú">
      <div className="space-y-5">
        <NoteBlock icon={Notes} title="Ghi chú">
          <p className="text-sm text-foreground">
            {order.note || "Chưa có ghi chú"}
          </p>
        </NoteBlock>

        <NoteBlock icon={LockKeyhole} title="Ghi chú nội bộ">
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
  icon: ComponentType<IconProps>
  title: string
  children: ReactNode
}

function NoteBlock({ icon: IconComponent, title, children }: NoteBlockProps) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <IconComponent className="size-3.5" />
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}
