import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Badge } from "@/components/ui/badge"
import { clientStatusLabels, ClientStatus } from "@/lib/types/client.type"
import type { Client } from "@/lib/types/client.type"
import { cn } from "@/lib/utils"

type ClientPickerStatusStyle = {
  badge: string
  dot: string
}

// Also read by ClientPicker.tsx's own selected-client badge — stays exported
// here rather than duplicated, same as orderBadgeStyles/OrderBadges.tsx.
export const clientPickerStatusStyles: Record<
  ClientStatus,
  ClientPickerStatusStyle
> = {
  [ClientStatus.ACTIVE]: {
    badge: "bg-success/15 text-success",
    dot: "bg-success",
  },
  [ClientStatus.PAUSED]: {
    badge: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
}

const clientPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Client
>()

type BuildClientPickerColumnsArgs = {
  selectedId?: string
}

export function buildClientPickerColumns({
  selectedId: _selectedId,
}: BuildClientPickerColumnsArgs = {}) {
  return clientPickerColumnHelper.columns([
    clientPickerColumnHelper.accessor("code", {
      header: "Mã KH",
      meta: { headerClassName: "w-28 min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {getValue()}
        </span>
      ),
    }),
    clientPickerColumnHelper.accessor("name", {
      header: "Tên khách hàng",
      meta: { headerClassName: "min-w-60" },
      cell: ({ getValue }) => (
        <p className="truncate text-xs font-medium text-foreground">
          {getValue()}
        </p>
      ),
    }),
    clientPickerColumnHelper.accessor(
      (row) => {
        const primary = row.contacts.find((contact) => contact.isPrimary)
        return (primary ?? row.contacts.at(0))?.name
      },
      {
        id: "primaryContact",
        header: "Người liên hệ",
        meta: { headerClassName: "min-w-36" },
        cell: ({ getValue }) => (
          <span className="truncate text-xs text-foreground">
            {getValue() ?? "—"}
          </span>
        ),
      }
    ),
    clientPickerColumnHelper.accessor(
      (row) => {
        const primary = row.contacts.find((contact) => contact.isPrimary)
        return row.phoneNumber || (primary ?? row.contacts.at(0))?.phoneNumber
      },
      {
        id: "phoneNumber",
        header: "Điện thoại",
        meta: { headerClassName: "min-w-28" },
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-foreground">
            {getValue() ?? "—"}
          </span>
        ),
      }
    ),
    clientPickerColumnHelper.accessor((row) => row.group.name, {
      id: "group",
      header: "Nhóm",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
    clientPickerColumnHelper.accessor("status", {
      header: "Trạng thái",
      meta: {
        headerClassName: "w-28 min-w-28 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => {
        const status = getValue()
        const { badge, dot } = clientPickerStatusStyles[status]

        return (
          <Badge variant="outline" className={badge}>
            <span className={cn("size-1.5 rounded-full", dot)} />
            {clientStatusLabels[status]}
          </Badge>
        )
      },
    }),
  ])
}
