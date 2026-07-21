import { Check, ChevronDown, History } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProductRevisionBadge } from "@/features/products/components/ProductRevisionBadge"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

type ProductRevisionSwitcherProps = {
  revisions: ProductRevision[]
  activeRevision: ProductRevision
  onOpenHistory: () => void
}

// The header's compact revision pill becomes a dropdown trigger. The list
// below is informational (which bản is hiện hành) — switching/creating is a
// deliberate action left to "Xem lịch sử revision…", not duplicated here.
export function ProductRevisionSwitcher({
  revisions,
  activeRevision,
  onOpenHistory,
}: ProductRevisionSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap text-muted-foreground ring-1 ring-border transition-colors ring-inset hover:bg-muted/70 hover:text-foreground"
        >
          {activeRevision.revisionNo}
          <ChevronDown className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Các bản Revision</DropdownMenuLabel>
        {revisions.map((revision) => (
          <div
            key={revision.id}
            className="flex items-center gap-2 px-2.5 py-1.5"
          >
            <span className="flex size-3.5 shrink-0 items-center justify-center">
              {revision.id === activeRevision.id ? (
                <Check className="size-3.5 text-primary" />
              ) : null}
            </span>
            <span className="font-mono text-xs font-medium text-foreground">
              {revision.revisionNo}
            </span>
            <ProductRevisionBadge
              isActive={revision.isActive}
              className="ml-auto"
            />
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onOpenHistory}>
          <History className="size-4" />
          Xem lịch sử Revision…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
