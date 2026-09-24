import { Button } from "@/components/ui/button"

type ProductionJobsSelectionBarProps = {
  selectedCount: number
  clientName: string
  onClearSelection: () => void
}

export function ProductionJobsSelectionBar({
  selectedCount,
  clientName,
  onClearSelection,
}: ProductionJobsSelectionBarProps) {
  return (
    <div className="mx-4 mb-3 flex items-center gap-2.5 rounded-md bg-primary/5 py-1.5 pr-1.5 pl-3 text-xs text-muted-foreground lg:mx-5">
      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
      <p className="min-w-0 flex-1 truncate">
        Đã chọn{" "}
        <strong className="font-semibold text-foreground">
          {selectedCount} Job
        </strong>{" "}
        của{" "}
        <strong className="font-semibold text-foreground">{clientName}</strong>
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onClearSelection}
      >
        Bỏ chọn
      </Button>
    </div>
  )
}
