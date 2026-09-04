import { useMemo, useState } from "react"
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
  isPending?: boolean
  // Seed the label for an already-selected `value` (update form / filter URL) so
  // the trigger shows a name before any option has been fetched.
  initialOption?: ComboboxOption
  emptyMessage?: string
  label?: string
  required?: boolean
  onBlur?: () => void
  isInvalid?: boolean
  errors?: ComponentProps<typeof FieldError>["errors"]
  // DOM node to portal the popup into — forwarded to RAC's Popover as
  // `UNSTABLE_portalContainer`. Pass the enclosing Dialog's content node when this field
  // is rendered inside one. Kept from the pre-RAC (base-ui) version defensively: Dialog
  // and Combobox are both RAC now, sharing one overlay/focus-coordination system, so the
  // original cross-library "portal outside the dialog's focus trap swallows the click"
  // bug this worked around may no longer apply — but the 3 existing dialog call sites
  // already wire a content-node ref for it, so keep honoring `container` rather than
  // assume it's safe to drop. Default undefined — table filters and non-dialog forms
  // portal to `<body>` as normal.
  container?: HTMLElement | null
}

export function ComboboxField({
  value,
  onValueChange,
  options,
  onSearchChange,
  isPending,
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
  container,
}: ComboboxFieldProps) {
  // Local label cache for the current selection — seeded from `initialOption`
  // and updated on pick, so the selected option renders even when it's outside
  // the current result page.
  const [selectedOption, setSelectedOption] = useState<ComboboxOption | null>(
    initialOption ?? null
  )

  // Reconcile with an externally-changed `value` (e.g. the filter "Làm mới" button
  // clearing it) or a late-resolving `initialOption` (its query loads after this
  // value is already set) — computed during render, not an effect, per React's
  // "adjust state when a prop changes" pattern (avoids the extra synchronous
  // re-render an effect-based setState would cause). Picking from the list already
  // updates both together, so this only fires on outside changes.
  const [prevValue, setPrevValue] = useState(value)
  const [prevInitialOption, setPrevInitialOption] = useState(initialOption)
  if (value !== prevValue || initialOption !== prevInitialOption) {
    setPrevValue(value)
    setPrevInitialOption(initialOption)

    if (!value) {
      setSelectedOption(null)
    } else if (
      selectedOption?.value !== value &&
      initialOption?.value === value
    ) {
      setSelectedOption(initialOption)
    }
  }

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
        value={selectedOption?.value ?? null}
        onChange={(key) => {
          const next = items.find((option) => option.value === key) ?? null
          setSelectedOption(next)
          onValueChange(next?.value)
        }}
        onInputChange={(next) => onSearchChange(next)}
        allowsEmptyCollection
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
        <ComboboxContent UNSTABLE_portalContainer={container ?? undefined}>
          <ComboboxList
            renderEmptyState={() => (
              <ComboboxEmpty>
                {isPending ? "Đang tìm..." : emptyMessage}
              </ComboboxEmpty>
            )}
          >
            {items.map((option) => (
              <ComboboxItem key={option.value} id={option.value}>
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
