import { useFieldArray, useWatch } from "react-hook-form"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import type { ComponentType } from "react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
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
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { estimateLineTotal } from "@/features/orders/logic/order-totals"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { currencyFormatter } from "@/lib/currency"
import {
  Currency,
  orderItemStatusLabels,
  OrderItemStatus,
} from "@/lib/types/order.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"

const orderItemStatusOptions = buildOptionsFromLabels(orderItemStatusLabels)

type UpdateOrderQuantitiesStepProps = {
  form: UseFormReturn<UpdateOrderSchema>
  disabled: boolean
}

type RowAction = {
  icon: ComponentType<{ className?: string }>
  label: string
  tone: "default" | "destructive"
  isDisabled: boolean
  onPress: () => void
}

// Bước ③ của wizard: đúng những sản phẩm đã tick ở bước ② (UpdateOrderSelectItemsStep.tsx), mọi
// field nhập tay đều inline ngay trong bảng — cùng khuôn CreateOrderQuantitiesStep.tsx (SL/giá/CK
// qua NumericCellInput, ghi chú qua TableTextCellInput, cả 2 commit lúc blur), CỘNG THÊM cột
// "Trạng thái" mà form Tạo không có (mọi dòng Tạo luôn NORMAL; huỷ 1 dòng chỉ có ý nghĩa thật
// trên đơn đã tồn tại). Không còn dialog sửa dòng (OrderItemDialog.tsx) — Trạng thái giờ cũng là
// 1 Select inline trong dòng, xem cell "status" bên dưới.
export function UpdateOrderQuantitiesStep({
  form,
  disabled,
}: UpdateOrderQuantitiesStepProps) {
  const { fields, update, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  })
  const currency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: Currency.VND,
  })

  const itemsErrors = form.formState.errors.items

  return (
    <div className="px-4 py-5 sm:px-5">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">
          Số lượng & giá
        </h2>
        <p className="text-sm text-muted-foreground">
          Nhập số lượng và đơn giá cho từng sản phẩm đã chọn
        </p>
      </div>

      {Array.isArray(itemsErrors) && (
        <FieldError
          className="mt-3"
          errors={itemsErrors.flatMap((rowError, index) => {
            const messages = Object.values(
              (rowError ?? {}) as Record<
                string,
                { message?: string } | undefined
              >
            )
            return messages
              .filter((error) => error?.message)
              .map((error) => ({
                message: `Dòng ${index + 1}: ${error?.message}`,
              }))
          })}
        />
      )}

      <div className="mt-4 overflow-x-auto rounded-md border border-dashed border-border/50 bg-card">
        <Table aria-label="Số lượng & giá">
          <TableHeader className="[&>tr]:h-12">
            <TableHead id="index" className="w-12">
              #
            </TableHead>
            <TableHead id="item" isRowHeader>
              Sản phẩm
            </TableHead>
            <TableHead id="unit">ĐVT</TableHead>
            <TableHead id="quantity" className="w-32">
              Số lượng
            </TableHead>
            <TableHead id="unitPrice" className="w-40">
              {`Đơn giá (${currency})`}
            </TableHead>
            <TableHead id="discountPercent" className="w-24">
              CK (%)
            </TableHead>
            <TableHead id="note" className="w-48">
              Ghi chú
            </TableHead>
            <TableHead id="status" className="w-36">
              Trạng thái
            </TableHead>
            <TableHead id="total" className="text-right">
              Thành tiền
            </TableHead>
            <TableHead id="actions" className="w-24 text-right">
              Thao tác
            </TableHead>
          </TableHeader>
          <TableBody
            renderEmptyState={() => (
              <TableEmpty
                colSpan={10}
                title="Chưa chọn sản phẩm nào"
                description={'Quay lại bước "Chọn sản phẩm" để thêm.'}
              />
            )}
          >
            {fields.map((field, index) => {
              const isCancelled = field.status === OrderItemStatus.CANCELLED
              const rowActions: RowAction[] = [
                {
                  icon: ArrowUp,
                  label: `Di chuyển lên dòng ${index + 1}`,
                  tone: "default",
                  isDisabled: disabled || index === 0,
                  onPress: () => move(index, index - 1),
                },
                {
                  icon: ArrowDown,
                  label: `Di chuyển xuống dòng ${index + 1}`,
                  tone: "default",
                  isDisabled: disabled || index === fields.length - 1,
                  onPress: () => move(index, index + 1),
                },
                {
                  icon: Trash2,
                  label: `Xóa dòng ${index + 1}`,
                  tone: "destructive",
                  isDisabled: disabled,
                  onPress: () => remove(index),
                },
              ]

              return (
                <TableRow key={field.id} id={field.id} className="h-14">
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>{field.itemLabel || "—"}</TableCell>
                  <TableCell>{field.itemUnit || "—"}</TableCell>
                  <TableCell>
                    <NumericCellInput
                      value={field.quantity}
                      min={1}
                      placeholder="0"
                      disabled={disabled}
                      onValueChange={(value) =>
                        update(index, { ...field, quantity: value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <NumericCellInput
                      value={field.unitPrice}
                      min={0}
                      placeholder="0"
                      disabled={disabled}
                      onValueChange={(value) =>
                        update(index, { ...field, unitPrice: value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <NumericCellInput
                      value={field.discountPercent}
                      min={0}
                      placeholder="0"
                      disabled={disabled}
                      onValueChange={(value) =>
                        update(index, { ...field, discountPercent: value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TableTextCellInput
                      value={field.note}
                      placeholder="Ghi chú (nếu có)"
                      disabled={disabled}
                      onValueChange={(value) =>
                        update(index, { ...field, note: value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {/*
                      Commit bằng update(index, {...field, status}), KHÔNG qua Controller/setValue:
                      useFieldArray's `fields` là snapshot chỉ làm mới qua thao tác mảng
                      (append/update/remove/move). Nếu cột này commit qua setValue thay vì
                      update(), field.status ở đây sẽ cũ đi ngay sau lần render kế — và lần
                      update(index, {...field, quantity}) tiếp theo từ ô lân cận sẽ ghi đè lại
                      status cũ, "undo" ngoài ý muốn 1 lượt huỷ dòng vừa chọn.
                    */}
                    <Select
                      aria-label={`Trạng thái dòng ${index + 1}`}
                      value={field.status}
                      onChange={(key) =>
                        update(index, {
                          ...field,
                          status: String(key) as OrderItemStatus,
                        })
                      }
                      isDisabled={disabled}
                    >
                      <SelectTrigger
                        size="sm"
                        className={cn(
                          "w-full text-xs",
                          isCancelled && "text-destructive"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderItemStatusOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            id={option.value}
                            className="text-xs"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      isCancelled && "text-muted-foreground line-through"
                    )}
                  >
                    {currencyFormatter.format(estimateLineTotal(field))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {rowActions.map((action) => (
                        <TooltipTrigger key={action.label}>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={action.label}
                            className={cn(
                              "text-muted-foreground",
                              action.tone === "destructive"
                                ? "hover:border-destructive/30 hover:text-destructive"
                                : "hover:border-primary/30 hover:text-primary"
                            )}
                            isDisabled={action.isDisabled}
                            onPress={action.onPress}
                          >
                            <action.icon className="size-3.5" />
                          </Button>
                          <Tooltip>{action.label}</Tooltip>
                        </TooltipTrigger>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
