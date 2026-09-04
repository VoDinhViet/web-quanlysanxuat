import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type WizardStepTab = {
  value: string
  label: string
  icon: ComponentType<LucideProps>
  disabled?: boolean
}

type WizardStepsTabsProps = {
  steps: WizardStepTab[]
  className?: string
}

// The TabsList/TabsTrigger row every create wizard's step nav renders — icon + label per step,
// a disabled/opacity treatment for a not-yet-reachable step. Only draws the triggers; the Tabs
// root (selectedKey/onSelectionChange) and TabsContent panels live in the form component, same
// split every wizard already used before this extraction. Which step is disabled (and why) stays
// a call-site concern — see CreateInventoryRequisitionStepsTabs.tsx.
export function WizardStepsTabs({ steps, className }: WizardStepsTabsProps) {
  return (
    <div className={cn("border-b border-border", className)}>
      {/* `group-data-horizontal/tabs:h-auto`, not plain `h-auto`: the list's cva base pins the
          height with that same variant chain, and tailwind-merge only dedupes when the chains
          match — otherwise the list stays 36px while the 48px triggers overflow it. */}
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
      >
        {steps.map((step) => (
          <TabsTrigger
            key={step.value}
            id={step.value}
            isDisabled={step.disabled}
            className={cn(
              "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
              // Both the plain `data-selected:bg-*` and the line-variant-scoped one have to be
              // repeated verbatim or tailwind-merge can't tell they're meant to replace the
              // primitive's.
              "data-selected:bg-primary/5 data-selected:text-primary",
              "group-data-[variant=line]/tabs-list:data-selected:bg-primary/5",
              "data-selected:hover:bg-primary/5",
              "after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5",
              step.disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <step.icon className="size-3.5" />
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
