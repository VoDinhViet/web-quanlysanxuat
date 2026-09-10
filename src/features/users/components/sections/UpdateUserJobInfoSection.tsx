import { useEffect, useMemo } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { withForm } from "@/hooks/use-app-form"
import { departmentQueryOptions } from "@/features/departments/api"
import { positionsQueryOptions } from "@/features/users/api/options"
import { updateUserFormDefaultValues } from "@/features/users/schemas/update-user.schema"
import { employeeStatusLabels } from "@/lib/types/user.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const employeeStatusOptions = buildOptionsFromLabels(employeeStatusLabels)

export const UpdateUserJobInfoSection = withForm({
  defaultValues: updateUserFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    // The route loader already prefetches this, so `isPending` resolves to `false` on the very
    // first render off cache — kept as a plain `useQuery` (not `useSuspenseQuery`) so the field
    // degrades gracefully with its own "Đang tải..." state instead of suspending the whole page
    // if that ever weren't true.
    const departmentsQuery = useQuery(departmentQueryOptions())
    const departments = departmentsQuery.data ?? []

    const departmentId = useField({ form, name: "departmentId" }).state.value
    const positionId = useField({ form, name: "positionId" }).state.value
    // Chức vụ phụ thuộc phòng ban (BE `ensurePositionInDepartment` bắt buộc cặp khớp nhau). Route
    // loader đã prefetch đúng cặp ban đầu (`positionsQueryOptions(user.department.id)`), nên lần
    // render đầu resolve ngay từ cache — chỉ đổi phòng ban mới thực sự phải tải lại.
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
    // (BE ném `position.error.department_mismatch`). Vô hại ở lần render đầu vì `positions`
    // đã chứa đúng `positionId` ban đầu (prefetch theo cùng phòng ban).
    useEffect(() => {
      if (
        positionId &&
        positions.length > 0 &&
        !positions.some((position) => position.id === positionId)
      ) {
        form.setFieldValue("positionId", "")
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
            <form.Field name="departmentId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-medium text-foreground"
                    >
                      Phòng ban <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      items={buildSelectOptions(departments)}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? "")}
                      disabled={disabled || departmentsQuery.isPending}
                    >
                      <SelectTrigger
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        className="h-9 w-full bg-background text-xs"
                      >
                        <SelectValue
                          placeholder={
                            departmentsQuery.isFetching
                              ? "Đang tải..."
                              : "Chọn phòng ban"
                          }
                        />
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
                              value={option.value}
                              className="text-xs"
                            >
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="positionId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-medium text-foreground"
                    >
                      Chức vụ <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      // While positions for the current department are still loading, the
                      // field's stored value can be a stale id from the previous department
                      // (the mismatch effect below only clears it once the new list has
                      // loaded) — masking it to "" here forces the placeholder to render
                      // "Đang tải..." instead of Radix showing a blank trigger for a value
                      // that matches no item yet.
                      items={positionOptions}
                      value={positionsQuery.isPending ? "" : field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? "")}
                      disabled={
                        disabled || !departmentId || positionsQuery.isPending
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        className="h-9 w-full bg-background text-xs"
                      >
                        <SelectValue
                          placeholder={
                            // `useQuery({enabled: false})` reports `isPending: true` even when
                            // idle (no department chosen yet) — gate on `departmentId` too so
                            // "Chọn phòng ban trước" doesn't get overridden by "Đang tải...".
                            !departmentId
                              ? "Chọn phòng ban trước"
                              : positionsQuery.isPending
                                ? "Đang tải..."
                                : "Chọn chức vụ"
                          }
                        />
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
                              value={option.value}
                              className="text-xs"
                            >
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.AppField name="hireDate">
              {(field) => (
                <field.DateField
                  label="Ngày vào làm"
                  required
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú"
                  placeholder="Nhập ghi chú (nếu có)"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="status">
              {(field) => (
                <field.RadioPillField
                  label="Tình trạng nhân sự"
                  required
                  options={employeeStatusOptions}
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    )
  },
})
