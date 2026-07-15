import { useNavigate } from "@tanstack/react-router"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Column } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  Package,
  Trash2,
} from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductDetails } from "@/features/products/components/product-details"
import { StatusBadge } from "@/features/products/components/status-badge"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"
import type { Product } from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"
import type { Pagination } from "@/lib/types/pagination.type"

const productColumnHelper = createColumnHelper<Product>()

const productColumns = [
  productColumnHelper.display({
    id: "image",
    header: "Hình ảnh",
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/40">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-full rounded-md object-cover"
            />
          ) : (
            <Package className="size-4 text-muted-foreground" />
          )}
        </div>
      )
    },
  }),
  productColumnHelper.accessor("customerName", {
    header: "Khách hàng",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  productColumnHelper.accessor("code", {
    header: "Mã sản phẩm",
  }),
  productColumnHelper.accessor("name", {
    header: "Tên sản phẩm",
  }),
  productColumnHelper.accessor("productGroupName", {
    header: "Nhóm sản phẩm",
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  productColumnHelper.accessor("revision", {
    header: "Rev",
  }),
  productColumnHelper.accessor("unit", {
    header: "ĐVT",
  }),
  productColumnHelper.accessor("status", {
    header: "Trạng thái",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  productColumnHelper.accessor("createdByName", {
    header: "Người tạo",
  }),
  productColumnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString("vi-VN"),
  }),
  productColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex items-center justify-center gap-1.5">
          <ProductDetails
            product={product}
            trigger={
              <IconButton label="Xem chi tiết">
                <Eye className="size-3.5" />
              </IconButton>
            }
          />
          <IconButton label="Chỉnh sửa">
            <Edit3 className="size-3.5" />
          </IconButton>
          <IconButton label="Nhân bản">
            <Copy className="size-3.5" />
          </IconButton>
          <IconButton label="Xóa">
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      )
    },
  }),
]

type ProductsTableProps = {
  rows: Product[]
  pagination: Pagination
}

export function ProductsTable({ rows, pagination }: ProductsTableProps) {
  const navigate = useNavigate({ from: "/manage/products" })

  const table = useReactTable({
    data: rows,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handlePageChange = (page: number) => {
    void navigate({ search: (prev) => ({ ...prev, page }) })
  }

  const handleLimitChange = (limit: ProductsSearchSchema["limit"]) => {
    void navigate({ search: (prev) => ({ ...prev, limit, page: 1 }) })
  }

  return (
    <div className="min-w-0 flex-1 overflow-hidden px-4 pb-4 lg:px-5">
      <div className="overflow-hidden rounded-md border border-border/50 bg-card">
        <Table className="text-xs [&_td]:border-r [&_td]:border-border/40 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/40 [&_th:last-child]:border-r-0">
          <TableHeader className="bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-13 hover:bg-muted/45">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={getProductHeaderClassName(header.column)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/20">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={getProductCellClassName(cell.column)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  )
}

function getPageWindow(current: number, totalPages: number, size: number) {
  const windowSize = Math.min(size, totalPages)
  const start = Math.min(
    Math.max(1, current - Math.floor(windowSize / 2)),
    totalPages - windowSize + 1
  )

  return Array.from({ length: windowSize }, (_, index) => start + index)
}

type TablePaginationProps = {
  pagination: Pagination
  onPageChange: (page: number) => void
  onLimitChange: (limit: ProductsSearchSchema["limit"]) => void
}

function TablePagination({
  pagination,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  const { currentPage, limit, totalRecords, totalPages } = pagination
  const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1
  const rangeEnd = Math.min(currentPage * limit, totalRecords)
  const pageWindow = getPageWindow(currentPage, totalPages, 4)

  return (
    <div className="flex flex-col gap-3 pt-4 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Hiển thị {rangeStart} đến {rangeEnd} trong tổng số {totalRecords} sản
        phẩm
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <PaginationButton
            ariaLabel="Trang trước"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </PaginationButton>
          {pageWindow.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="icon-sm"
              className={cn(
                "text-xs font-medium",
                pageNumber !== currentPage && "bg-background text-foreground"
              )}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <PaginationButton
            ariaLabel="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </PaginationButton>
        </div>

        <Select
          value={String(limit)}
          onValueChange={(value) =>
            onLimitChange(Number(value) as ProductsSearchSchema["limit"])
          }
        >
          <SelectTrigger className="h-9 w-28 bg-background text-xs font-medium text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function PaginationButton({
  ariaLabel,
  disabled,
  onClick,
  children,
}: {
  ariaLabel: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="bg-background text-foreground"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function getProductHeaderClassName(column: Column<Product>) {
  return cn(
    "px-4 text-xs font-semibold text-foreground",
    column.id === "image" && "w-16 text-center",
    column.id === "customerName" && "min-w-36",
    column.id === "code" && "min-w-24",
    column.id === "name" && "min-w-44",
    column.id === "productGroupName" && "min-w-32",
    column.id === "revision" && "w-16 text-center",
    column.id === "unit" && "w-16 text-center",
    column.id === "status" && "min-w-28 text-center",
    column.id === "createdByName" && "min-w-28",
    column.id === "createdAt" && "min-w-28",
    column.id === "actions" && "min-w-36 text-center"
  )
}

function getProductCellClassName(column: Column<Product>) {
  return cn(
    "px-4 py-0 text-xs font-medium text-foreground",
    column.id === "image" && "text-center",
    column.id === "name" && "font-normal",
    column.id === "revision" && "text-center",
    column.id === "unit" && "text-center",
    column.id === "status" && "text-center",
    column.id === "actions" && "font-normal"
  )
}

function IconButton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}
