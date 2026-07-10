import { IconBuildingFactory as Factory } from "@tabler/icons-react"

export function IndustrialBrandPanel() {
  return (
    <aside className="relative hidden flex-1 overflow-hidden border-r border-primary bg-primary p-16 text-primary-foreground lg:flex lg:w-1/2 lg:items-center lg:justify-center">
      <div className="relative z-10 max-w-lg">
        <div className="mb-10 flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
            <Factory className="size-8" />
          </div>
          <div>
            <p className="text-3xl font-bold leading-10 tracking-tight">
              Công Ty TNHH Cơ Khí
              <span className="block text-amber-200">Khuôn Mẫu Tiến Huy</span>
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">
              Hệ thống quản trị sản xuất
            </p>
          </div>
        </div>

        <div className="border-l-2 border-primary-foreground/25 pl-10">
          <p className="text-xl font-medium leading-8 text-primary-foreground/80">
            Tối ưu vận hành sản xuất bằng dữ liệu chính xác và quy trình có kiểm
            soát.
          </p>
        </div>
      </div>

      <div className="absolute bottom-16 left-16 flex gap-1">
        <div className="h-1 w-12 bg-primary-foreground" />
        <div className="h-1 w-4 bg-primary-foreground/30" />
        <div className="h-1 w-4 bg-primary-foreground/30" />
      </div>
    </aside>
  )
}
