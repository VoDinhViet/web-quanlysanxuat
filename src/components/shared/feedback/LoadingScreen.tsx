import { Spinner } from "@/components/ui/spinner"

export function LoadingScreen() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background text-muted-foreground">
      <Spinner className="size-8" />
    </div>
  )
}
