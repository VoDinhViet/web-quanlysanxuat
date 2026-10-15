import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"

import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildNcrOrderPickerColumns } from "@/features/ncrs/components/composites/NcrOrderPickerColumns"
import { NcrCreateStepCard } from "@/features/ncrs/components/layouts/NcrCreateStepCard"
import { createNcrFormDefaultValues } from "@/features/ncrs/schemas/create-ncr.schema"
import { ordersQueryOptions } from "@/features/orders/api"
import { withForm } from "@/hooks/use-app-form"
import { appTableFeatures } from "@/lib/table-features"
import type { Item } from "@/lib/types/item.type"
import type { Order } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const columns = buildNcrOrderPickerColumns()

type ClientPicker = {
  options: ComboboxOption[]
  onSearchChange: (query: string) => void
  isFetching: boolean
}

type NcrOrderClientStepProps = {
  disabled: boolean
  isCustomerNcr: boolean
  selectedItem: Item | undefined
  selectedClient: ComboboxOption | undefined
  orderId: string
  isDone: boolean
  clientPicker: ClientPicker
  onOrderSelect: (order: Order | null) => void
  onClientChange: (clientId: string) => void
}

const defaultProps: NcrOrderClientStepProps = {
  disabled: false,
  isCustomerNcr: false,
  selectedItem: undefined,
  selectedClient: undefined,
  orderId: "",
  isDone: false,
  clientPicker: {
    options: [],
    onSearchChange: () => undefined,
    isFetching: false,
  },
  onOrderSelect: () => undefined,
  onClientChange: () => undefined,
}

type OrderTableProps = {
  itemCode: string
  orderId: string
  disabled: boolean
  onOrderSelect: (order: Order | null) => void
}

// The backend has no "orders containing this item" filter, but its `q` also matches the item
// code/name on order lines — so searching by the item code lists the orders that hold it.
function OrderTable({
  itemCode,
  orderId,
  disabled,
  onOrderSelect,
}: OrderTableProps) {
  const [page, setPage] = useState(1)
  const ordersQuery = useQuery({
    ...ordersQueryOptions({ page, limit: 10, q: itemCode }),
    placeholderData: keepPreviousData,
  })
  const orders = ordersQuery.data?.data ?? []
  const pagination = ordersQuery.data?.pagination

  const reactTable = useTable({
    data: orders,
    columns,
    features: appTableFeatures,
  })

  function handleSelect(nextOrderId: string) {
    if (disabled) return
    onOrderSelect(orders.find((order) => order.id === nextOrderId) ?? null)
  }

  return (
    <div className="space-y-3">
      <RadioGroup
        value={orderId}
        onValueChange={handleSelect}
        disabled={disabled}
        className="block gap-0 overflow-x-auto rounded-md border border-border/50 bg-card"
      >
        <Table aria-label="Đơn hàng chứa sản phẩm đã chọn">
          <TableHeader className="[&>tr]:h-11 [&>tr]:hover:bg-muted/45">
            <TableRow>
              {reactTable.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TableEmpty
                    colSpan={columns.length}
                    title={
                      ordersQuery.isPending
                        ? "Đang tải..."
                        : "Chưa có đơn hàng nào chứa sản phẩm này"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              reactTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "h-12 bg-card hover:bg-muted/25",
                    !disabled && "cursor-pointer",
                    row.original.id === orderId &&
                      "bg-primary/[0.04] hover:bg-primary/[0.08]"
                  )}
                  onClick={() => handleSelect(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </RadioGroup>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {pagination && (
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.limit}
            total={pagination.totalRecords}
            onPageChange={setPage}
            disabled={disabled}
            className="flex-1"
          />
        )}
        {orderId !== "" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={disabled}
            onClick={() => onOrderSelect(null)}
          >
            Bỏ chọn đơn hàng
          </Button>
        )}
      </div>
    </div>
  )
}

// Step 3: locked until a product is picked; the order table is scoped to it.
// Picking an order fills the client (the combobox stays editable); the order itself is optional.
export const NcrOrderClientStep = withForm({
  defaultValues: createNcrFormDefaultValues,
  props: defaultProps,
  render: function Render({
    form,
    disabled,
    isCustomerNcr,
    selectedItem,
    selectedClient,
    orderId,
    isDone,
    clientPicker,
    onOrderSelect,
    onClientChange,
  }) {
    return (
      <NcrCreateStepCard
        step={3}
        title="Chọn đơn hàng & khách hàng"
        description="Cần chọn đơn hàng để tạo LSX phụ — có thể bỏ qua"
        isDone={isDone}
        isDisabled={!selectedItem}
      >
        {selectedItem ? (
          <div className="space-y-4">
            <OrderTable
              key={selectedItem.id}
              itemCode={selectedItem.code}
              orderId={orderId}
              disabled={disabled}
              onOrderSelect={onOrderSelect}
            />
            <form.Field name="clientId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Khách hàng"
                  required={isCustomerNcr}
                  placeholder="Chọn khách hàng"
                  value={field.state.value || undefined}
                  onValueChange={(next) => {
                    field.handleChange(next ?? "")
                    onClientChange(next ?? "")
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  errors={field.state.meta.errors}
                  options={clientPicker.options}
                  onSearchChange={clientPicker.onSearchChange}
                  isPending={clientPicker.isFetching}
                  initialOption={selectedClient}
                  emptyMessage="Không tìm thấy khách hàng"
                  disabled={disabled}
                />
              )}
            </form.Field>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Chọn sản phẩm ở bước 2 để xem các đơn hàng chứa sản phẩm đó.
          </p>
        )}
      </NcrCreateStepCard>
    )
  },
})
