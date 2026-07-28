import { Icon } from "@iconify/react"
import documentsBold from "@iconify-icons/solar/documents-bold"
import fileTextBold from "@iconify-icons/solar/file-text-bold"
import lockKeyholeBold from "@iconify-icons/solar/lock-keyhole-bold"
import notesBold from "@iconify-icons/solar/notes-bold"
import paperclipBold from "@iconify-icons/solar/paperclip-bold"
import type { IconifyIcon } from "@iconify/types"
import type { ReactNode } from "react"

import { resolveFileUrl } from "@/lib/file-url"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailNotesTabProps = {
  order: OrderDetail
}

export function OrderDetailNotesTab({ order }: OrderDetailNotesTabProps) {
  return (
    <div className="space-y-6 p-4 sm:p-5">
      <NotesSection icon={notesBold} title="Ghi chú">
        <p className="text-sm text-foreground">
          {order.note || "Chưa có ghi chú"}
        </p>
      </NotesSection>

      <NotesSection icon={lockKeyholeBold} title="Ghi chú nội bộ">
        <p className="text-sm text-foreground">
          {order.internalNote || "Chưa có ghi chú nội bộ"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Không hiển thị cho khách hàng.
        </p>
      </NotesSection>

      <NotesSection icon={paperclipBold} title="Tài liệu đính kèm">
        {order.attachments.length > 0 ? (
          <ul className="space-y-1.5">
            {order.attachments.map((attachment) => (
              <li key={attachment.id}>
                {/* The download route is @Public(), so the signed URL opens in a
                    new tab without an auth header. */}
                <a
                  href={resolveFileUrl(attachment.file.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <Icon
                    icon={fileTextBold}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">
                    {attachment.file.originalName}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
            <Icon
              icon={documentsBold}
              className="size-7 text-muted-foreground/40"
            />
            <p className="text-[11px] font-medium text-muted-foreground">
              Chưa có tài liệu đính kèm
            </p>
          </div>
        )}
      </NotesSection>
    </div>
  )
}

type NotesSectionProps = {
  icon: IconifyIcon
  title: string
  children: ReactNode
}

function NotesSection({ icon, title, children }: NotesSectionProps) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon icon={icon} className="size-4 text-muted-foreground" />
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}
