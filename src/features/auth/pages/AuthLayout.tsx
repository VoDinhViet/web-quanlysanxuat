import { Outlet } from "@tanstack/react-router"

import { ScrollArea } from "@/components/ui/scroll-area"
import { IndustrialBrandPanel } from "@/features/auth/components/IndustrialBrandPanel"

export function AuthLayout() {
  return (
    <ScrollArea className="h-screen w-full bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <IndustrialBrandPanel />
        <main className="relative flex flex-1 flex-col items-center justify-center bg-card px-4 py-12 sm:px-8 lg:w-1/2 lg:px-16">
          <div className="w-full max-w-120">
            <Outlet />
          </div>
          <p className="absolute bottom-6.5 text-xs text-muted-foreground">
            © 2026 Công Ty TNHH Cơ Khí Khuôn Mẫu Tiến Huy
          </p>
        </main>
      </div>
    </ScrollArea>
  )
}
