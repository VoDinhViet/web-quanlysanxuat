import { Link } from "@tanstack/react-router"
import { Edit3, Eye } from "lucide-react"

import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { IconButton } from "@/components/shared/primitives/IconButton"
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

// "Xem chi tiết" now goes to a real route (GET /api/supplier-returns/:id) — no longer a
// client-side sheet built from list data. "Chỉnh sửa" stays disabled: the module still has no
// create/update/print route.
type SupplierReturnActionsCellProps = {
  supplierReturn: SupplierReturn
}

export function SupplierReturnActionsCell({
  supplierReturn,
}: SupplierReturnActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton
        label="Xem chi tiết"
        asChild
        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
      >
        <Link
          to="/manage/supplier-returns/$supplierReturnId"
          params={{ supplierReturnId: supplierReturn.id }}
        >
          <Eye className="size-3.5" />
        </Link>
      </IconButton>
      <DisabledAction label="Chỉnh sửa" hint="tính năng sắp có">
        <Edit3 className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
