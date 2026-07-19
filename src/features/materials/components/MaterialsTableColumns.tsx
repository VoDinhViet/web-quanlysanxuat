import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { Ban, CircleCheck, Edit3, Eye, ImageOff, Trash2 } from "lucide-react"

import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { DeleteMaterialDialog } from "@/features/materials/components/DeleteMaterialDialog"
import {
  MaterialStatusBadge,
  MaterialTypeBadge,
} from "@/features/materials/components/MaterialBadges"
import { MaterialDetails } from "@/features/materials/components/MaterialDetails"
import { ToggleMaterialStatusDialog } from "@/features/materials/components/ToggleMaterialStatusDialog"
import { MaterialStatus } from "@/features/materials/types/material.type"
import type { Material } from "@/features/materials/types/material.type"

const materialColumnHelper = createColumnHelper<Material>()

export const materialColumns = [
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
            {material.imageUrl ? (
              <Image
                src={material.imageUrl}
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
  materialColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-20" },
  }),
  materialColumnHelper.accessor((row) => row.group.name, {
    id: "group",
    header: "Nhóm vật tư",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  materialColumnHelper.accessor("type", {
    header: "Loại vật tư",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <MaterialTypeBadge type={getValue()} />,
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
      const isActive = material.status === MaterialStatus.ACTIVE

      return (
        <div className="flex items-center justify-center gap-1.5">
          <MaterialDetails
            material={material}
            trigger={
              <IconButton
                label="Xem chi tiết"
                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
              >
                <Eye className="size-3.5" />
              </IconButton>
            }
          />
          <PermissionGate permission="materials:update">
            <IconButton
              label="Chỉnh sửa"
              asChild
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Link
                to="/manage/materials/$materialId/edit"
                params={{ materialId: material.id }}
              >
                <Edit3 className="size-3.5" />
              </Link>
            </IconButton>
          </PermissionGate>
          <PermissionGate permission="materials:update">
            <ToggleMaterialStatusDialog
              material={material}
              trigger={
                <IconButton
                  label={isActive ? "Ngừng sử dụng" : "Kích hoạt lại"}
                  className={
                    isActive
                      ? "text-muted-foreground hover:border-amber-300 hover:text-amber-600"
                      : "text-muted-foreground hover:border-emerald-300 hover:text-emerald-600"
                  }
                >
                  {isActive ? (
                    <Ban className="size-3.5" />
                  ) : (
                    <CircleCheck className="size-3.5" />
                  )}
                </IconButton>
              }
            />
          </PermissionGate>
          <PermissionGate permission="materials:delete">
            <DeleteMaterialDialog
              material={material}
              trigger={
                <IconButton
                  label="Xóa"
                  className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              }
            />
          </PermissionGate>
        </div>
      )
    },
  }),
]
