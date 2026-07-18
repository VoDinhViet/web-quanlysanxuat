import { Icon } from "@iconify/react"

import { Button } from "@/components/ui/button"
import { QUICK_ACTIONS } from "@/features/manage/mock/manage-dashboard.mock"
import { cn } from "@/lib/utils"

export function ManageQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.label}
          type="button"
          variant="outline"
          className={cn(
            "h-auto flex-col gap-1.5 px-2 py-4 text-center text-[11px] whitespace-normal",
            action.tileClassName
          )}
        >
          <Icon
            icon={action.icon}
            className={cn("size-6", action.accentClassName)}
          />
          <span className={action.accentClassName}>{action.label}</span>
        </Button>
      ))}
    </div>
  )
}
