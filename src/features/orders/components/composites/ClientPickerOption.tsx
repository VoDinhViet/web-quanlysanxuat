import { Check } from "lucide-react"

import { ClientPickerStatusBadge } from "@/features/orders/components/composites/ClientPickerStatusBadge"
import type { Client } from "@/lib/types/client.type"
import { cn } from "@/lib/utils"

type ClientPickerOptionProps = {
  client: Client
  isSelected: boolean
  onSelect: (client: Client) => void
}

export function ClientPickerOption({
  client,
  isSelected,
  onSelect,
}: ClientPickerOptionProps) {
  const primaryContact =
    client.contacts.find((contact) => contact.isPrimary) ??
    client.contacts.at(0)
  const phone = client.phoneNumber || primaryContact?.phoneNumber

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(client)}
      className={cn(
        "group flex w-full items-center justify-between gap-4 border-b border-border/60 px-3 py-3 text-left transition-colors cursor-pointer last:border-b-0",
        "hover:bg-muted/30",
        "focus-visible:bg-muted/30 focus-visible:outline-none",
        isSelected &&
          "border-l-2 border-l-primary bg-primary/5 pl-3.5 hover:bg-primary/8"
      )}
    >
      {/* Thông tin chính */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary",
              isSelected && "text-primary"
            )}
          >
            {client.name}
          </span>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {client.code}
          </span>
        </div>

        {/* Dòng phụ tinh gọn, dùng dấu chấm ngăn cách thay vì icon dày đặc */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {primaryContact?.name && <span>{primaryContact.name}</span>}
          {primaryContact?.name && (phone || client.group?.name) && (
            <span className="text-muted-foreground/40">•</span>
          )}
          {phone && <span className="font-mono">{phone}</span>}
          {phone && client.group?.name && (
            <span className="text-muted-foreground/40">•</span>
          )}
          {client.group?.name && (
            <span className="rounded bg-muted/60 px-1.5 py-0.2 text-[10px] text-muted-foreground">
              {client.group.name}
            </span>
          )}
        </div>
      </div>

      {/* Trạng thái & Dấu check khi được chọn */}
      <div className="flex shrink-0 items-center gap-3">
        <ClientPickerStatusBadge status={client.status} />

        <div className="flex size-5 items-center justify-center">
          {isSelected && (
            <Check className="size-4 text-primary stroke-[2.5]" />
          )}
        </div>
      </div>
    </button>
  )
}
