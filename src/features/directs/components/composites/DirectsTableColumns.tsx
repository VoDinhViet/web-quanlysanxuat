import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"
import { CircleCheck, CirclePause, Copy, Edit3 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DirectStatusBadge } from "@/features/directs/components/primitives/DirectBadges"
import { CopyDirectDialog } from "@/features/directs/components/composites/CopyDirectDialog"
import { ToggleDirectStatusDialog } from "@/features/directs/components/composites/ToggleDirectStatusDialog"
import { ItemStatus } from "@/lib/types/item.type"
import { resolveFileUrl } from "@/lib/file-url"
import type { Direct } from "@/lib/types/direct.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const directColumnHelper = createColumnHelper<typeof appTableFeatures, Direct>()

export const directColumns = directColumnHelper.columns([
  directColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
  }),
  // Combined identity cell — thumbnail + name over code reads far faster than
  // three separate image / code / name columns.
  directColumnHelper.display({
    id: "direct",
    header: "Vật tư",
    meta: { headerClassName: "min-w-64" },
    cell: ({ row }) => {
      const direct = row.original

      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {direct.image ? (
              <Image
                src={resolveFileUrl(direct.image.url)}
                alt={direct.name}
                layout="fullWidth"
                objectFit="cover"
                className="size-full"
              />
            ) : (
              <Gallery className="size-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {direct.name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {direct.code}
            </p>
          </div>
        </div>
      )
    },
  }),
  directColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-20" },
  }),
  directColumnHelper.accessor("minStock", {
    header: "Định mức tồn",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  directColumnHelper.accessor((row) => row.client?.name ?? "—", {
    id: "client",
    header: "Khách hàng",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  directColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <DirectStatusBadge status={getValue()} />,
  }),
  directColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-44 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const direct = row.original
      const isActive = direct.status === ItemStatus.ACTIVE

      return (
        <div className="flex items-center justify-center gap-1.5">
          <RoutePermissionGate route="/manage/directs/$directId/update">
            <Tooltip>
              <TooltipTrigger
                render={
                  <LinkButton
                    to="/manage/directs/$directId/update"
                    params={{ directId: direct.id }}
                    variant="outline"
                    size="icon-sm"
                    aria-label="Chỉnh sửa"
                    className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                  >
                    <Edit3 className="size-3.5" />
                  </LinkButton>
                }
              />
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
          </RoutePermissionGate>
          <PermissionGate permission="items:copy">
            <Tooltip>
              <CopyDirectDialog
                direct={direct}
                trigger={
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Sao chép"
                        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>Sao chép</TooltipContent>
            </Tooltip>
          </PermissionGate>
          <PermissionGate permission="items:update">
            <Tooltip>
              <ToggleDirectStatusDialog
                direct={direct}
                trigger={
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={
                          isActive ? "Ngừng sử dụng" : "Kích hoạt lại"
                        }
                        className={
                          isActive
                            ? "text-muted-foreground hover:border-warning/40 hover:text-warning"
                            : "text-muted-foreground hover:border-success/40 hover:text-success"
                        }
                      >
                        {isActive ? (
                          <CirclePause className="size-3.5" />
                        ) : (
                          <CircleCheck className="size-3.5" />
                        )}
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>
                {isActive ? "Ngừng sử dụng" : "Kích hoạt lại"}
              </TooltipContent>
            </Tooltip>
          </PermissionGate>
        </div>
      )
    },
  }),
])
