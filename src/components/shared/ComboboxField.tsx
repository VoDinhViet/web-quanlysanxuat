import { useEffect, useMemo, useState } from "react"
import type { ComponentProps } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export type ComboboxOption = {
  value: string
  label: string
}

// Presentational, controlled, domain-agnostic searchable combobox. It does NOT
// fetch: the caller supplies `options` and `onSearchChange` reports what the
// user typed so the caller can query the API. The optional form chrome (label,
// errors, isInvalid) mirrors DatePickerField so it drops into a TanStack Form
// field via `form.Field`, while still working standalone (e.g. table filters).
type ComboboxFieldProps = Pick<
  ComponentProps<"input">,
  "id" | "placeholder" | "disabled" | "className"
> & {
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  options: ComboboxOption[]
  onSearchChange: (query: string) => void
  isLoading?: boolean
  // Seed the label for an already-selected `value` (edit form / filter URL) so
  // the trigger shows a name before any option has been fetched.
  initialOption?: ComboboxOption
  emptyMessage?: string
  label?: string
  required?: boolean
  onBlur?: () => void
  isInvalid?: boolean
  errors?: ComponentProps<typeof FieldError>["errors"]
}

export function ComboboxField({
  value,
  onValueChange,
  options,
  onSearchChange,
  isLoading,
  initialOption,
  emptyMessage = "Không tìm thấy kết quả",
  label,
  required,
  onBlur,
  isInvalid,
  errors,
  id,
  placeholder,
  disabled,
  className,
}: ComboboxFieldProps) {
  // Local label cache for the current selection — seeded from `initialOption`
  // and updated on pick, so the selected option renders even when it's outside
  // the current result page.
  const [selectedOption, setSelectedOption] = useState<ComboboxOption | null>(
    initialOption ?? null
  )

  // Reconcile with an externally-changed `value` (e.g. the filter "Làm mới"
  // button clearing it). Picking from the list already updates both, so this
  // only acts on outside changes.
  useEffect(() => {
    if (!value) {
      setSelectedOption(null)
      return
    }

    setSelectedOption((current) => {
      if (current?.value === value) {
        return current
      }

      return initialOption?.value === value ? initialOption : current
    })
  }, [value, initialOption])

  const items = useMemo(() => {
    if (
      selectedOption &&
      !options.some((o) => o.value === selectedOption.value)
    ) {
      return [selectedOption, ...options]
    }

    return options
  }, [options, selectedOption])

  return (
    <Field data-invalid={isInvalid}>
      {label ? (
        <FieldLabel
          htmlFor={id}
          className="text-xs font-medium text-foreground"
        >
          {label}{" "}
          {required ? <span className="text-destructive">*</span> : null}
        </FieldLabel>
      ) : null}
      <Combobox
        items={items}
        value={selectedOption}
        onValueChange={(next: ComboboxOption | null) => {
          setSelectedOption(next)
          onValueChange(next?.value)
        }}
        itemToStringLabel={(option: ComboboxOption) => option.label}
        isItemEqualToValue={(
          a: ComboboxOption | null,
          b: ComboboxOption | null
        ) => a?.value === b?.value}
        filter={null}
        onInputValueChange={(next: string) => onSearchChange(next)}
      >
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={isInvalid}
          onBlur={onBlur}
          showClear={Boolean(selectedOption) && !disabled}
          className={cn("w-full", className)}
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {isLoading ? "Đang tìm..." : emptyMessage}
          </ComboboxEmpty>
          <ComboboxList>
            {items.map((option) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {errors ? <FieldError errors={errors} /> : null}
    </Field>
  )
}
