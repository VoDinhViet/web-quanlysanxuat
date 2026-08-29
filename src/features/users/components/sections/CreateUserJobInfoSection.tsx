import { useEffect, useMemo } from "react"
import { Controller, useWatch } from "react-hook-form"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import type { UseFormReturn } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { DatePicker } from "@/features/users/components/composites/DatePicker"
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
  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: departments } = useSuspenseQuery(
    departmentOptionsQueryOptions()
  )

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
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger
                    id={field.name}
                    onBlur={field.onBlur}
                    aria-invalid={!!fieldState.error}
                    className="h-9 w-full bg-background text-xs"
                  >
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildSelectOptions(departments).map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
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
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled || !departmentId}
                >
                  <SelectTrigger
                    id={field.name}
                    onBlur={field.onBlur}
                    aria-invalid={!!fieldState.error}
                    className="h-9 w-full bg-background text-xs"
                  >
                    <SelectValue
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
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
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
                  isInvalid={!!fieldState.error}
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
                  onValueChange={field.onChange}
                  disabled={disabled}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {employeeStatusOptions.map((option) => (
                    <FieldLabel
                      key={option.value}
                      htmlFor={`status-${option.value}`}
                      className="cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground has-data-checked:border-primary has-data-checked:bg-primary/5 has-data-checked:text-primary"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`status-${option.value}`}
                      />
                      {option.label}
                    </FieldLabel>
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
