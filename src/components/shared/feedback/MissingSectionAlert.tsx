import { TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"

type MissingSectionAlertProps = {
  children: ReactNode
}

// Block-level counterpart to MissingFieldValue: an entire section has no backing endpoint at
// all (not just one field), so it replaces the section's whole content with an explanation
// rather than yellow-flagging individual rows. Same warning idiom as
// ProductionOrderItemsCard.tsx's unsaved-changes alert.
export function MissingSectionAlert({ children }: MissingSectionAlertProps) {
  return (
    <Alert className="border-warning/30 bg-warning/10 py-2.5">
      <TriangleAlert className="text-warning" />
      <AlertDescription className="text-xs text-warning/90">
        {children}
      </AlertDescription>
    </Alert>
  )
}
