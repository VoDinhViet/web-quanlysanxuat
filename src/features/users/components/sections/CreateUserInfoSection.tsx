import { Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/features/users/components/composites/DatePicker"
import { ImageUploader } from "@/features/users/components/composites/ImageUploader"
import { genderLabels } from "@/lib/types/user.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"

const genderOptions = buildOptionsFromLabels(genderLabels)

type CreateUserInfoSectionProps = {
  form: UseFormReturn<CreateUserSchema>
  disabled: boolean
}

// Each field is a plain <Controller> render-prop, same idiom as LoginForm.tsx — no shared RHF
// field kit, kept deliberately simple for a form still under trial (see forms-and-ui.md).
export function CreateUserInfoSection({
  form,
  disabled,
}: CreateUserInfoSectionProps) {
  return (
    <div>
      <div className="px-4 py-4 sm:px-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Thông tin cá nhân
        </h2>
        <p className="text-sm text-muted-foreground">
          Thông tin định danh cơ bản của nhân sự
        </p>
      </div>

      <div className="px-4 pb-5 sm:px-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field
                  className="sm:col-span-2"
                  data-invalid={!!fieldState.error}
                >
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-foreground"
                  >
                    Họ và tên <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập họ và tên"
                    className="h-9 bg-background text-xs"
                    aria-invalid={!!fieldState.error}
                    disabled={disabled}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <div className="space-y-1.5 sm:col-span-2">
                  <span className="block text-xs font-medium text-foreground">
                    Giới tính
                  </span>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                    className="flex flex-row flex-wrap gap-2"
                  >
                    {genderOptions.map((option) => (
                      <FieldLabel
                        key={option.value}
                        htmlFor={`gender-${option.value}`}
                        className="cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground has-data-checked:border-primary has-data-checked:bg-primary/5 has-data-checked:text-primary"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`gender-${option.value}`}
                        />
                        {option.label}
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="dateOfBirth"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel className="text-xs font-medium text-foreground">
                    Ngày sinh
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
              name="idNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-foreground"
                  >
                    Số CCCD/CMND
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập số CCCD/CMND"
                    className="h-9 bg-background text-xs"
                    aria-invalid={!!fieldState.error}
                    disabled={disabled}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-foreground"
                  >
                    Số điện thoại
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    className="h-9 bg-background text-xs"
                    aria-invalid={!!fieldState.error}
                    disabled={disabled}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="address"
              render={({ field }) => (
                <Field className="sm:col-span-2">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-foreground"
                  >
                    Địa chỉ thường trú
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Nhập địa chỉ thường trú"
                    className="min-h-20 resize-none bg-background text-xs"
                    disabled={disabled}
                  />
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
