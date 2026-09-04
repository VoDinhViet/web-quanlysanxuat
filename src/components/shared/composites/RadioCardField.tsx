import { Radio } from "react-aria-components"
import { Check } from "lucide-react"

import { RadioGroup } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { IconProps } from "@solar-icons/react"
import type { AnyFieldApi } from "@tanstack/react-form"
import type { ComponentType } from "react"

export type RadioCardOption<TValue extends string> = {
  value: TValue
  label: string
  description: string
  icon: ComponentType<IconProps>
  // Tailwind classes for the checked-state card border, icon-chip tint, and corner check badge
  // — each call site supplies its own tone (PASS=success, FAIL=destructive, CONCESSION=amber,
  // SORT=violet, RETURN=neutral), so this component itself stays domain-agnostic.
  activeClassName: string
  chipClassName: string
  badgeClassName: string
}

type RadioCardFieldProps<TValue extends string> = {
  field: AnyFieldApi
  options: RadioCardOption<TValue>[]
  disabled?: boolean
  columns?: 2 | 3
}

// Large radio cards (icon chip + label + description + a checked badge) — originally built for
// IQC's §3 KẾT QUẢ (2 cards, PASS/FAIL) and §5 QUYẾT ĐỊNH XỬ LÝ (3 cards, CONCESSION/SORT/
// RETURN), now shared with OQC's own PASS/FAIL result cards (3rd use — promoted out of
// src/features/iqc/ per the repo's cross-feature layer boundary). Each card is now the
// `RadioGroupPrimitive.Item` itself (radix thô, không qua `RadioGroupItem` chấm tròn của
// shadcn) — không còn nút radio tròn riêng, trạng thái chọn chỉ thể hiện qua viền/nền thẻ
// (activeClassName) + badge check nổi ở góc trên-phải. Checked state vẫn tính ở JS từ
// `field.state.value` (not CSS has-*/group-has-* chaining) — simpler to reason about, and the
// same comparison drives both the card tint and the icon-chip tint. Takes `field: AnyFieldApi`
// rather than going through useFieldContext/form.AppField's typed registry — call sites bind
// different enums per feature (IqcResult/IqcDisposition/OqcResult/OqcDisposition), and each
// feature's form type differs, so a single shared component can't be typed more tightly than
// this.
export function RadioCardField<TValue extends string>({
  field,
  options,
  disabled,
  columns = 2,
}: RadioCardFieldProps<TValue>) {
  return (
    <RadioGroup
      value={field.state.value}
      onChange={(value) => field.handleChange(value)}
      isDisabled={disabled}
      className={cn(
        "grid gap-3",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {options.map((option) => {
        const Icon = option.icon
        const isChecked = field.state.value === option.value

        return (
          <Radio
            key={option.value}
            value={option.value}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-border bg-card p-4 text-start transition-colors hover:border-foreground/25 data-disabled:cursor-not-allowed data-disabled:opacity-50",
              isChecked && option.activeClassName
            )}
          >
            <div className="flex items-start gap-3 pr-5">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
                  isChecked && option.chipClassName
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>

            {isChecked ? (
              <span
                className={cn(
                  "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full",
                  option.badgeClassName
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : null}
          </Radio>
        )
      })}
    </RadioGroup>
  )
}
