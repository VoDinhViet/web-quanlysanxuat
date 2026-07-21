import { cn } from "@/lib/utils"

export function ProductRevisionBadge({
  isActive,
  className,
}: {
  isActive: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        isActive
          ? "bg-success/10 text-success ring-success/20"
          : "bg-muted text-muted-foreground ring-border",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-success" : "bg-muted-foreground/50"
        )}
      />
      {isActive ? "Hiện hành" : "Cũ"}
    </span>
  )
}
