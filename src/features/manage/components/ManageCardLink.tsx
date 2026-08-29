import { Link } from "@tanstack/react-router"

import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { cn } from "@/lib/utils"
import type { ManageRoutePath } from "@/lib/route-permissions"

type ManageCardLinkProps = {
  label?: string
  to?: ManageRoutePath
  className?: string
}

/** Shared bottom-right "see more" link used by every dashboard widget, so the
 *  call-to-action reads identically across tables, charts, and cards. Pass `to` once a
 *  widget has a real destination route — gated by RoutePermissionGate so it never links
 *  somewhere the signed-in user can't open. Omit `to` to keep the static, non-navigating
 *  label used by widgets still on mock/placeholder data. */
export function ManageCardLink({
  label = "Xem chi tiết →",
  to,
  className,
}: ManageCardLinkProps) {
  if (!to) {
    return (
      <div className={cn("flex justify-end", className)}>
        <span className="text-[11px] font-medium text-primary">{label}</span>
      </div>
    )
  }

  return (
    <RoutePermissionGate route={to}>
      <div className={cn("flex justify-end", className)}>
        <Link
          to={to}
          className="text-[11px] font-medium text-primary hover:underline"
        >
          {label}
        </Link>
      </div>
    </RoutePermissionGate>
  )
}
