import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"
import { CircleCheck, CirclePause, Edit3 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { MaterialStatusBadge } from "@/features/materials/components/primitives/MaterialBadges"
import { ToggleMaterialStatusDialog } from "@/features/materials/components/composites/ToggleMaterialStatusDialog"
import { ItemStatus } from "@/lib/types/item.type"
import { resolveFileUrl } from "@/lib/file-url"
import type { Material } from "@/lib/types/material.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const materialColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Material
>()

export const materialColumns = materialColumnHelper.columns([
  materialColumnHelper.display({
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
  materialColumnHelper.display({
    id: "material",
    header: "Vật tư",
    meta: { headerClassName: "min-w-64" },
    cell: ({ row }) => {
      const material = row.original

      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {material.image ? (
              <Image
                src={resolveFileUrl(material.image.url)}
                alt={material.name}
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
  materialColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-20" },
  }),
  materialColumnHelper.accessor("minStock", {
    header: "Định mức tồn",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  materialColumnHelper.accessor((row) => row.client?.name ?? "—", {
    id: "client",
    header: "Khách hàng",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  materialColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <MaterialStatusBadge status={getValue()} />,
  }),
  materialColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const material = row.original
      const isActive = material.status === ItemStatus.ACTIVE

      return (
        <div className="flex items-center justify-center gap-1.5">
          <RoutePermissionGate route="/manage/materials/$materialId/update">
            <TooltipTrigger>
              <LinkButton
                to="/manage/materials/$materialId/update"
                params={{ materialId: material.id }}
                variant="outline"
                size="icon-sm"
                aria-label="Chỉnh sửa"
                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
              >
                <Edit3 className="size-3.5" />
              </LinkButton>
              <Tooltip>Chỉnh sửa</Tooltip>
            </TooltipTrigger>
          </RoutePermissionGate>
          <PermissionGate permission="items:update">
            <ToggleMaterialStatusDialog
              material={material}
              trigger={
                <TooltipTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={isActive ? "Ngừng sử dụng" : "Kích hoạt lại"}
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
                  <Tooltip>
                    {isActive ? "Ngừng sử dụng" : "Kích hoạt lại"}
                  </Tooltip>
                </TooltipTrigger>
              }
            />
          </PermissionGate>
        </div>
      )
    },
  }),
])
