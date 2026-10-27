import { PenNewSquare, TrashBinTrash } from "@solar-icons/react"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeleteItemCategoryDialog } from "@/features/item-categories/components/composites/DeleteItemCategoryDialog"
import { UpdateItemCategoryDialog } from "@/features/item-categories/components/composites/UpdateItemCategoryDialog"
import type { ItemCategory } from "@/lib/types/item-category.type"

const itemCategoryColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ItemCategory
>()

export const itemCategoryColumns = itemCategoryColumnHelper.columns([
  itemCategoryColumnHelper.accessor("code", {
    header: "Mã nhóm",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-foreground">
        {getValue()}
      </span>
    ),
  }),
  itemCategoryColumnHelper.accessor("name", {
    header: "Tên nhóm",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </p>
    ),
  }),
  itemCategoryColumnHelper.accessor("description", {
    header: "Mô tả",
    meta: { headerClassName: "min-w-56" },
    cell: ({ getValue }) => (
      <p className="max-w-80 truncate text-xs text-muted-foreground">
        {getValue() ?? "—"}
      </p>
    ),
  }),
  itemCategoryColumnHelper.accessor("updatedAt", {
    header: "Cập nhật lúc",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),
  itemCategoryColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => {
      const itemCategory = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <PermissionGate permission="items:update">
            <Tooltip>
              <UpdateItemCategoryDialog
                itemCategory={itemCategory}
                trigger={
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Chỉnh sửa"
                        className="text-muted-foreground hover:border-border hover:text-primary"
                      >
                        <PenNewSquare className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
          </PermissionGate>
          <PermissionGate permission="items:update">
            <Tooltip>
              <DeleteItemCategoryDialog
                itemCategory={itemCategory}
                trigger={
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Xóa"
                        className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                      >
                        <TrashBinTrash className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent>Xóa</TooltipContent>
            </Tooltip>
          </PermissionGate>
        </div>
      )
    },
  }),
])
