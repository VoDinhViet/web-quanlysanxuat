import { useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Factory, Info, PackageSearch, Search } from "lucide-react"
import { Radio } from "@base-ui/react/radio"
import { useDebounceValue } from "usehooks-ts"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildCreateInventoryRequisitionJobPickerColumns } from "@/features/inventory-requisitions/components/composites/CreateInventoryRequisitionJobPickerColumns"
import { productionJobOptionsQueryOptions } from "@/features/production-jobs/api"
import { createInventoryRequisitionFormDefaultValues } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { withForm } from "@/hooks/use-app-form"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { cn } from "@/lib/utils"
import { ProductionJobStatus } from "@/lib/types/production-job.type"

type SourceOptionValue =
  | typeof InventoryRequisitionType.PRODUCTION
  | typeof InventoryRequisitionType.OTHER

type SourceOption = {
  value: SourceOptionValue
  icon: ComponentType<LucideProps>
  title: string
  description: string
}

// 2 lựa chọn nguồn lãnh, mỗi lựa chọn dẫn tới cách khoanh vùng vật tư khác nhau ở bước ② — đáng
// một thẻ chọn lớn có mô tả thay vì pill nhỏ như RadioPillField (dùng cho toggle 2 giá trị đơn
// giản, không có hệ quả gì cần giải thích, ví dụ requiresIqc). Vẫn dựng trên đúng RadioGroup của
// RadioPillField, nhưng dùng thẳng `Radio` (react-aria-components) thay vì `RadioGroupItem` — cả
// thẻ là 1 Radio, chấm tròn cuối thẻ chỉ là span trang trí đọc `isChecked` từ field.state.value
// (không thể lồng RadioGroupItem — cũng tự render `<label>` riêng — vào trong 1 Radio khác).
const sourceOptions: SourceOption[] = [
  {
    value: InventoryRequisitionType.PRODUCTION,
    icon: Factory,
    title: "Lãnh từ LSX",
    description: "Vật tư khoanh theo đúng định mức BOM của Job đã chọn.",
  },
  {
    value: InventoryRequisitionType.OTHER,
    icon: PackageSearch,
    title: "Lãnh thủ công",
    description: "Chọn tự do trong mọi vật tư nguyên liệu tại kho.",
  },
]

const ACTIVE_JOB_STATUSES = [
  ProductionJobStatus.PENDING,
  ProductionJobStatus.IN_PROGRESS,
]

export const CreateInventoryRequisitionSourceSection = withForm({
  defaultValues: createInventoryRequisitionFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const type = useField({ form, name: "type" }).state.value
    const isJobFlow = type === InventoryRequisitionType.PRODUCTION

    // Chọn Job bằng React Table đồng bộ với toàn hệ thống: backend lọc PENDING/IN_PROGRESS trực tiếp qua statuses.
    const [jobQ, setJobQ] = useState("")
    const [debouncedJobQ] = useDebounceValue(jobQ, 300)
    const jobsQuery = useQuery({
      ...productionJobOptionsQueryOptions(
        debouncedJobQ,
        undefined,
        ACTIVE_JOB_STATUSES
      ),
      placeholderData: keepPreviousData,
    })
    const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])

    const columns = useMemo(
      () => buildCreateInventoryRequisitionJobPickerColumns({ disabled }),
      [disabled]
    )

    const table = useTable({
      data: jobs,
      columns,
      features: appTableFeatures,
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ① Nguồn lãnh
          </h2>
          <p className="text-sm text-muted-foreground">
            Nguồn lãnh quyết định vật tư nào được phép chọn ở bước sau.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <form.Field name="type">
            {(field) => (
              <RadioGroup
                // Radix widens onChange to `string`; the cast narrows back to the field's
                // real literal union, same idiom RadioPillField uses.
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as SourceOptionValue)
                }
                disabled={disabled}
                className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2"
              >
                {sourceOptions.map((option) => {
                  const isChecked = field.state.value === option.value

                  return (
                    <Radio.Root
                      key={option.value}
                      value={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors",
                        "hover:border-primary/40 hover:bg-muted/30",
                        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                        isChecked && "border-primary bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors",
                          isChecked && "bg-primary text-primary-foreground"
                        )}
                      >
                        <option.icon className="size-5" />
                      </span>
                      <span className="flex-1 space-y-0.5">
                        <span className="block text-sm font-semibold text-foreground">
                          {option.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input transition-colors",
                          isChecked && "border-primary bg-primary"
                        )}
                      >
                        {isChecked && (
                          <span className="size-2 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                    </Radio.Root>
                  )
                })}
              </RadioGroup>
            )}
          </form.Field>

          {isJobFlow ? (
            <form.Field name="productionJobId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid} className="sm:col-span-2">
                    <FieldLabel className="text-xs font-medium text-foreground">
                      Job cần lãnh vật tư{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>

                    <div className="relative max-w-sm">
                      <Input
                        placeholder="Tìm Job theo mã..."
                        className="pr-9 text-xs placeholder:text-muted-foreground/75"
                        value={jobQ}
                        disabled={disabled}
                        onChange={(event) => setJobQ(event.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) =>
                        !disabled && field.handleChange(value)
                      }
                      className="mt-2 block max-h-72 gap-0 overflow-auto rounded-md border border-dashed border-border/50 bg-card"
                    >
                      <Table aria-label="Danh sách Job">
                        <TableHeader className="sticky top-0 z-10 bg-card [&>tr]:h-12 [&>tr]:hover:bg-muted/45">
                          <TableRow>
                            {table.getFlatHeaders().map((header) => (
                              <TableHead
                                key={header.id}
                                className={
                                  header.column.columnDef.meta?.headerClassName
                                }
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
                        <TableBody
                          className={cn(jobsQuery.isFetching && "opacity-50")}
                        >
                          {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={columns.length}>
                                <TableEmpty
                                  colSpan={columns.length}
                                  title={
                                    jobsQuery.isPending
                                      ? "Đang tải..."
                                      : "Không tìm thấy Job"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ) : (
                            table.getRowModel().rows.map((row) => {
                              const isSelected =
                                field.state.value === row.original.id

                              return (
                                <TableRow
                                  key={row.original.id}
                                  className={cn(
                                    "h-12 cursor-pointer bg-card hover:bg-muted/25",
                                    isSelected && "bg-primary/5"
                                  )}
                                  onClick={() =>
                                    !disabled &&
                                    field.handleChange(row.original.id)
                                  }
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                      key={cell.id}
                                      className={
                                        cell.column.columnDef.meta
                                          ?.cellClassName
                                      }
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </RadioGroup>

                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>
          ) : (
            <div className="flex items-start gap-2 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground sm:col-span-2">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Lãnh thủ công không cần chọn Job — bấm "Tiếp theo" để chọn vật
                tư ở bước ②.
              </span>
            </div>
          )}
        </div>
      </div>
    )
  },
})
