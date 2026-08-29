import { useEffect, useMemo } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

import { withForm } from "@/hooks/use-app-form"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { positionsQueryOptions } from "@/features/users/api/options"
import { createUserFormDefaultValues } from "@/features/users/schemas/create-user.schema"
import { employeeStatusLabels } from "@/lib/types/user.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const employeeStatusOptions = buildOptionsFromLabels(employeeStatusLabels)

export const CreateUserJobInfoSection = withForm({
  defaultValues: createUserFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    // The route loader already prefetches this — resolves synchronously off cache.
    const { data: departments } = useSuspenseQuery(
      departmentOptionsQueryOptions()
    )

    const departmentId = useField({ form, name: "departmentId" }).state.value
    const positionId = useField({ form, name: "positionId" }).state.value
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

    // Đổi phòng ban thì chức vụ đang chọn không còn hợp lệ — xoá để không gửi lên cặp lệch
    // (BE ném `position.error.department_mismatch`).
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
            <form.AppField name="departmentId">
              {(field) => (
                <field.SelectField
                  label="Phòng ban"
                  required
                  placeholder="Chọn phòng ban"
                  options={buildSelectOptions(departments)}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.SelectField
                  label="Chức vụ"
                  required
                  placeholder={
                    departmentId ? "Chọn chức vụ" : "Chọn phòng ban trước"
                  }
                  options={buildSelectOptions(positions)}
                  disabled={disabled || !departmentId}
                  // `useQuery({enabled: false})` reports `isPending: true` even when idle (no
                  // department chosen yet) — gate on `departmentId` too so "Chọn phòng ban
                  // trước" doesn't get overridden by "Đang tải...".
                  isPending={!!departmentId && positionsQuery.isPending}
                />
              )}
            </form.AppField>

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
