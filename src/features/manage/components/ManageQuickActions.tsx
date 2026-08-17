import { Button } from "@/components/ui/button"
import { quickActions } from "@/features/manage/mock/manage-dashboard.mock"
import { cn } from "@/lib/utils"

export function ManageQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          type="button"
          variant="outline"
          className={cn(
            "h-auto flex-col gap-1.5 px-2 py-4 text-center text-[11px] whitespace-normal",
            action.tileClassName
          )}
        >
          <action.icon className={cn("size-6", action.accentClassName)} />
          <span className={action.accentClassName}>{action.label}</span>
        </Button>
      ))}
    </div>
  )
}
