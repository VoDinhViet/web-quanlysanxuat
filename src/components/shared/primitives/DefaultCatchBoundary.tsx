import { useRouter } from "@tanstack/react-router"
import { AlertOctagon } from "lucide-react"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/utils"

// Router-level fallback for every route without its own errorComponent — i.e.
// everything outside (authed), which keeps AuthedErrorFallback. Deliberately a
// second copy of that markup rather than a shared shell, see ui-kit.md.
export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
      <AlertOctagon className="size-10 text-destructive" />
      <p className="text-sm font-medium text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      <Button type="button" onClick={() => void router.invalidate()}>
        Thử lại
      </Button>
    </div>
  )
}
