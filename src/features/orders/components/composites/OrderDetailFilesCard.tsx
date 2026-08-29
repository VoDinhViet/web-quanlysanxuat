import { Documents, FileText, Paperclip } from "@solar-icons/react"
import { DateTime } from "luxon"
import prettyBytes from "pretty-bytes"

import { OrderDetailSectionCard } from "@/features/orders/components/layouts/OrderDetailSectionCard"
import { resolveFileUrl } from "@/lib/file-url"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailFilesCardProps = {
  order: OrderDetail
}

export function OrderDetailFilesCard({ order }: OrderDetailFilesCardProps) {
  return (
    <OrderDetailSectionCard
      icon={Paperclip}
      title={`Tài liệu đính kèm (${order.files.length})`}
    >
      {order.files.length > 0 ? (
        <ul className="space-y-1.5">
          {order.files.map((orderFile) => (
            <li key={orderFile.id}>
              <a
                href={resolveFileUrl(orderFile.file.url)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">
                  {orderFile.file.originalName}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {prettyBytes(orderFile.file.size)}
                </span>
                <span className="hidden shrink-0 text-muted-foreground sm:inline">
                  {DateTime.fromISO(orderFile.file.createdAt).toFormat(
                    "dd/MM/yyyy"
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
          <Documents className="size-7 text-muted-foreground/40" />
          <p className="text-[11px] font-medium text-muted-foreground">
            Chưa có tài liệu đính kèm
          </p>
        </div>
      )}
    </OrderDetailSectionCard>
  )
}
