import { Outlet } from "@tanstack/react-router"

import { ScrollArea } from "@/components/ui/scroll-area"
import { IndustrialBrandPanel } from "@/features/auth/components/industrial-brand-panel"

export function AuthLayout() {
  return (
    <ScrollArea className="h-screen w-full bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <IndustrialBrandPanel />
        <main className="flex flex-1 items-center justify-center bg-card px-4 py-12 sm:px-8 lg:w-1/2 lg:px-16">
          <div className="w-full max-w-110">
            <Outlet />
          </div>
        </main>
      </div>
    </ScrollArea>
  )
}
