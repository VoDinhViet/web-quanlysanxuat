import { cn } from "@/lib/utils"

type ManageCardLinkProps = {
  label?: string
  className?: string
}

/** Shared bottom-right "see more" link used by every dashboard widget, so the
 *  call-to-action reads identically across tables, charts, and cards. */
export function ManageCardLink({
  label = "Xem chi tiết →",
  className,
}: ManageCardLinkProps) {
  return (
    <div className={cn("flex justify-end", className)}>
      <span className="text-[11px] font-medium text-primary">{label}</span>
    </div>
  )
}
