import { useEffect, useMemo } from "react"
import { Controller, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Radio } from "react-aria-components"
import type { UseFormReturn } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { RadioGroup } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { departmentQueryOptions } from "@/features/departments/api"
import { DatePicker } from "@/components/shared/composites/DatePicker"
import { positionsQueryOptions } from "@/features/users/api/options"
import { employeeStatusLabels } from "@/lib/types/user.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"

const employeeStatusOptions = buildOptionsFromLabels(employeeStatusLabels)

type CreateUserJobInfoSectionProps = {
  form: UseFormReturn<CreateUserSchema>
  disabled: boolean
}

// Each field is a plain <Controller> render-prop, same idiom as LoginForm.tsx — no shared RHF
// field kit, kept deliberately simple for a form still under trial (see forms-and-ui.md).
export function CreateUserJobInfoSection({
  form,
  disabled,
}: CreateUserJobInfoSectionProps) {
  // The route loader already prefetches this, so `isPending` resolves to `false` on the very
  // first render off cache — kept as a plain `useQuery` (not `useSuspenseQuery`) so the field
  // degrades gracefully with its own "Đang tải..." state instead of suspending the whole page
  // if that ever weren't true.
  const departmentsQuery = useQuery(departmentQueryOptions())
  const departments = departmentsQuery.data ?? []

  const departmentId = useWatch({ control: form.control, name: "departmentId" })
  const positionId = useWatch({ control: form.control, name: "positionId" })
  // Chức vụ phụ thuộc phòng ban (BE `ensurePositionInDepartment` bắt buộc cặp khớp nhau) nên
  // chỉ tải khi đã chọn phòng ban — không thể prefetch ở loader vì chưa biết phòng ban lúc mount.
  const positionsQuery = useQuery({
    ...positionsQueryOptions(departmentId),
    enabled: !!departmentId,
  })
  const positions = useMemo(
    () => positionsQuery.data ?? [],
    [positionsQuery.data]
  )
  const positionOptions = buildSelectOptions(positions)

  // Đổi phòng ban thì chức vụ đang chọn không còn hợp lệ — xoá để không gửi lên cặp lệch
  // (BE ném `position.error.department_mismatch`).
  useEffect(() => {
    if (
      positionId &&
      positions.length > 0 &&
      !positions.some((position) => position.id === positionId)
    ) {
      form.setValue("positionId", "")
    }
  }, [positions, positionId, form])

  return (
    <div>
      <div className="px-4 py-4 sm:px-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Thông tin công việc
        </h2>
        <p className="text-sm text-muted-foreground">
          Phân công và tình trạng làm việc
        </p>
      </div>

      <div className="px-4 pb-5 sm:px-5">
        <div className="space-y-5">
          <Controller
            control={form.control}
            name="departmentId"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-medium text-foreground"
                >
                  Phòng ban <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  selectedKey={departmentsQuery.isPending ? "" : field.value}
                  onSelectionChange={(key) => field.onChange(String(key))}
                  isDisabled={disabled || departmentsQuery.isPending}
                  placeholder={
                    departmentsQuery.isPending
                      ? "Đang tải..."
                      : "Chọn phòng ban"
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    onBlur={field.onBlur}
                    aria-invalid={!!fieldState.error}
                    className="h-9 w-full bg-background text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        Không có dữ liệu
                      </div>
                    ) : (
                      buildSelectOptions(departments).map((option) => (
                        <SelectItem
                          key={option.value}
                          id={option.value}
                          className="text-xs"
                        >
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="positionId"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-medium text-foreground"
                >
                  Chức vụ <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  // While positions for the current department are still loading, the field's
                  // stored value can be a stale id from the previous department (the mismatch
                  // effect below only clears it once the new list has loaded) — masking it to
                  // "" here forces the placeholder to render "Đang tải..." instead of Radix
                  // showing a blank trigger for a value that matches no item yet.
                  selectedKey={positionsQuery.isPending ? "" : field.value}
                  onSelectionChange={(key) => field.onChange(String(key))}
                  isDisabled={
                    disabled || !departmentId || positionsQuery.isPending
                  }
                  placeholder={
                    // `useQuery({enabled: false})` reports `isPending: true` even when idle
                    // (no department chosen yet) — gate on `departmentId` too so "Chọn
                    // phòng ban trước" doesn't get overridden by "Đang tải...".
                    !departmentId
                      ? "Chọn phòng ban trước"
                      : positionsQuery.isPending
                        ? "Đang tải..."
                        : "Chọn chức vụ"
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    onBlur={field.onBlur}
                    aria-invalid={!!fieldState.error}
                    className="h-9 w-full bg-background text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        Không có dữ liệu
                      </div>
                    ) : (
                      positionOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          id={option.value}
                          className="text-xs"
                        >
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="hireDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel className="text-xs font-medium text-foreground">
                  Ngày vào làm <span className="text-destructive">*</span>
                </FieldLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="note"
            render={({ field }) => (
              <Field>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-medium text-foreground"
                >
                  Ghi chú
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Nhập ghi chú (nếu có)"
                  className="min-h-20 resize-none bg-background text-xs"
                  disabled={disabled}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-foreground">
                  Tình trạng nhân sự <span className="text-destructive">*</span>
                </span>
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  isDisabled={disabled}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {employeeStatusOptions.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground data-selected:border-primary data-selected:bg-primary/5 data-selected:text-primary"
                    >
                      {option.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
