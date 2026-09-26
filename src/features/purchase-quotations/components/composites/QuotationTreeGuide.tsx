import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type QuotationTreeGuideProps = {
  // The last child ends the vertical line at its own branch instead of running on to the next row.
  isLast?: boolean
}

// First cell of every child row in the RFQ tree table: a vertical guide line under the vật tư's
// expand arrow plus a short horizontal branch into the row — the classic tree-view connector.
export function QuotationTreeGuide({ isLast }: QuotationTreeGuideProps) {
  return (
    <TableCell className="relative p-0">
      <span
        aria-hidden
        className={cn(
          "absolute top-0 left-[30px] w-px bg-border",
          isLast ? "h-1/2" : "h-full"
        )}
      />
      <span
        aria-hidden
        className="absolute top-1/2 left-[30px] h-px w-4 bg-border"
      />
    </TableCell>
  )
}
