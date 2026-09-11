import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MissingFieldValue } from "@/components/shared/primitives/MissingFieldValue"
import type { SupplierReturn } from "@/lib/types/supplier-return.type"

// Mã IQC / Mã NK / PO all render the same way: a reference code in the shared linked-code style
// when the backend returns one, or a yellow "--" when the row has no linked PO/phiếu nhập/IQC
// (as opposed to a genuinely empty field, which would use a plain em dash — see
// MissingFieldValue's own doc comment).
type SupplierReturnCodeCellProps = {
  code: string | null
}

export function SupplierReturnCodeCell({ code }: SupplierReturnCodeCellProps) {
  if (code === null) {
    return <MissingFieldValue label="--" />
  }

  return (
    <span className="font-mono text-xs font-semibold text-primary">{code}</span>
  )
}

// "Xem chi tiết" dẫn tới route thực tế (GET /api/supplier-returns/:id).
type SupplierReturnActionsCellProps = {
  supplierReturn: SupplierReturn
}

export function SupplierReturnActionsCell({
  supplierReturn,
}: SupplierReturnActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/supplier-returns/$supplierReturnId"
              params={{ supplierReturnId: supplierReturn.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>
    </div>
  )
}
