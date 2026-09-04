import { LinkButton } from "@/components/ui/button"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { cn } from "@/lib/utils"
import type { ManageRoutePath } from "@/lib/route-permissions"

type ManageCardLinkProps = {
  label?: string
  to: ManageRoutePath
  className?: string
}

/** Shared bottom-right "see more" link used by every dashboard widget, so the
 *  call-to-action reads identically across tables, charts, and cards — gated by
 *  RoutePermissionGate so it never links somewhere the signed-in user can't open. */
export function ManageCardLink({
  label = "Xem chi tiết →",
  to,
  className,
}: ManageCardLinkProps) {
  return (
    <RoutePermissionGate route={to}>
      <div className={cn("flex justify-end", className)}>
        <LinkButton
          to={to}
          variant="link"
          className="h-auto p-0 text-[11px] font-medium"
        >
          {label}
        </LinkButton>
      </div>
    </RoutePermissionGate>
  )
}
