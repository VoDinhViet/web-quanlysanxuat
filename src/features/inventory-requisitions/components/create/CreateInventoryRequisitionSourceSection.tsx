import { useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  Factory,
  Info,
  PackageSearch,
  Search,
} from "lucide-react"
import { DateTime } from "luxon"
import { useDebounceValue } from "usehooks-ts"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { productionJobOptionsQueryOptions } from "@/features/production-jobs/api"
import { createInventoryRequisitionFormDefaultValues } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { withForm } from "@/hooks/use-app-form"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { cn } from "@/lib/utils"
import type { ProductionJob } from "@/lib/types/production-job.type"

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
// giản, không có hệ quả gì cần giải thích, ví dụ requiresIqc). Vẫn dựng trên đúng
// RadioGroup/RadioGroupItem của RadioPillField — chỉ khác lớp trình bày, không phải primitive mới.
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

const quantityFormatter = new Intl.NumberFormat("vi-VN")

function formatDueDate(dueDate: string | null): string {
  return dueDate === null
    ? "—"
    : DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")
}

// Bước ① — chọn nguồn lãnh bằng thẻ radio lớn (LSX/thủ công dùng chung 1 route/form, không tách
// route nữa). Combobox Job chỉ hiện khi chọn "Lãnh từ LSX". Không còn field "Kho lãnh": chỉ có
// đúng 1 kho loại RM (KHO-NVL), form cha tự gắn warehouseId, không cho chọn. Hiệu ứng phụ khi đổi
// nguồn/Job (reset `items`, tự điền `productionOrderId`) sống ở component cha (cùng idiom
// appliedJobIdRef của InventoryReceiptCreateFromJobForm.tsx) — section này chỉ vẽ field.
export const CreateInventoryRequisitionSourceSection = withForm({
  defaultValues: createInventoryRequisitionFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const type = useField({ form, name: "type" }).state.value
    const isJobFlow = type === InventoryRequisitionType.PRODUCTION

    // Chọn Job bằng bảng thay vì combobox: cùng 1 endpoint dropdown vốn có
    // (getProductionJobOptions — chỉ Job đang IN_PROGRESS, cap 100, có `q`), nhưng nó vẫn trả
    // nguyên `ProductionJob` (không chỉ id/code) nên đủ cột để render một bảng chọn thật, dễ nhận
    // diện Job hơn một dropdown chỉ có mã.
    const [jobQ, setJobQ] = useState("")
    const [debouncedJobQ] = useDebounceValue(jobQ, 300)
    const jobsQuery = useQuery({
      ...productionJobOptionsQueryOptions(debouncedJobQ),
      placeholderData: keepPreviousData,
    })
    const jobs = jobsQuery.data ?? []

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
                // Radix widens onValueChange to `string`; the cast narrows back to the field's
                // real literal union, same idiom RadioPillField uses.
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as SourceOptionValue)
                }
                disabled={disabled}
                className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2"
              >
                {sourceOptions.map((option) => (
                  <FieldLabel
                    key={option.value}
                    htmlFor={`${field.name}-${option.value}`}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors",
                      "has-data-checked:border-primary has-data-checked:bg-primary/5",
                      "hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors",
                        "group-has-data-checked:bg-primary group-has-data-checked:text-primary-foreground"
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
                    <RadioGroupItem
                      value={option.value}
                      id={`${field.name}-${option.value}`}
                      className="mt-0.5"
                    />
                  </FieldLabel>
                ))}
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

                    <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-md border border-dashed border-border/50 bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="h-10 hover:bg-muted/45">
                            <TableHead>Mã Job</TableHead>
                            <TableHead>Mã LSX</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead className="text-center">SL</TableHead>
                            <TableHead className="text-center">
                              Hạn giao
                            </TableHead>
                            <TableHead className="w-9" />
                          </TableRow>
                        </TableHeader>
                        <TableBody
                          className={cn(jobsQuery.isFetching && "opacity-50")}
                        >
                          {jobs.length === 0 ? (
                            <TableEmpty
                              colSpan={6}
                              title={
                                jobsQuery.isPending
                                  ? "Đang tải..."
                                  : "Không tìm thấy Job"
                              }
                            />
                          ) : (
                            jobs.map((job: ProductionJob) => (
                              <TableRow
                                key={job.id}
                                className={cn(
                                  "h-12 cursor-pointer bg-card hover:bg-muted/25",
                                  field.state.value === job.id && "bg-primary/5"
                                )}
                                onClick={() =>
                                  !disabled && field.handleChange(job.id)
                                }
                              >
                                <TableCell className="font-mono font-semibold text-primary">
                                  {job.code}
                                </TableCell>
                                <TableCell className="font-mono text-muted-foreground">
                                  {job.orderCode}
                                </TableCell>
                                <TableCell>{job.client?.name ?? "—"}</TableCell>
                                <TableCell className="text-center">
                                  {quantityFormatter.format(job.quantity)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatDueDate(job.dueDate)}
                                </TableCell>
                                <TableCell>
                                  {field.state.value === job.id && (
                                    <CheckCircle2 className="size-4 text-primary" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

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
