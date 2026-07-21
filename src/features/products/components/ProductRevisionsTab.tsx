import { DateTime } from "luxon"
import { Icon } from "@iconify/react"
import checkCircleBold from "@iconify-icons/solar/check-circle-bold"
import copyBold from "@iconify-icons/solar/copy-bold"
import penBold from "@iconify-icons/solar/pen-bold"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { ProductRevisionBadge } from "@/features/products/components/ProductRevisionBadge"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

type ProductRevisionsTabProps = {
  revisions: ProductRevision[]
  onEdit: (revisionId: string) => void
  onPromote: (revisionId: string) => void
  onDuplicate: (revision: ProductRevision) => void
}

// The full management surface for revisions: every bản, its status, and the
// actions the header switcher deliberately keeps out of its own dropdown.
export function ProductRevisionsTab({
  revisions,
  onEdit,
  onPromote,
  onDuplicate,
}: ProductRevisionsTabProps) {
  return (
    <div>
      <div className="px-4 py-5 sm:px-5">
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="h-12 hover:bg-muted/45">
                <TableHead>Mã</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisions.map((revision) => (
                <TableRow
                  key={revision.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  <TableCell className="font-mono font-semibold text-foreground">
                    {revision.revisionNo}
                  </TableCell>
                  <TableCell>
                    <ProductRevisionBadge isActive={revision.isActive} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {DateTime.fromISO(revision.createdAt).toFormat(
                      "dd/MM/yyyy"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {revision.creator?.username ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-muted-foreground">
                    {revision.note || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <PermissionGate permission="products:update">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              label="Sửa"
                              onClick={() => onEdit(revision.id)}
                            >
                              <Icon icon={penBold} className="size-3.5" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                        {!revision.isActive ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconButton
                                label="Đặt hiện hành"
                                className="text-success"
                                onClick={() => onPromote(revision.id)}
                              >
                                <Icon
                                  icon={checkCircleBold}
                                  className="size-3.5"
                                />
                              </IconButton>
                            </TooltipTrigger>
                            <TooltipContent>Đặt hiện hành</TooltipContent>
                          </Tooltip>
                        ) : null}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              label="Nhân bản"
                              className="text-primary"
                              onClick={() => onDuplicate(revision)}
                            >
                              <Icon icon={copyBold} className="size-3.5" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Nhân bản</TooltipContent>
                        </Tooltip>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
