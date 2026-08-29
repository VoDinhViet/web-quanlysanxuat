export function IndustrialBrandPanel() {
  return (
    <aside className="hidden flex-1 flex-col justify-center gap-7 bg-primary px-15 py-14 text-primary-foreground lg:flex lg:w-1/2">
      <div className="max-w-110">
        <p className="mb-7.5 text-xs font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
          Hệ thống quản trị sản xuất
        </p>
        <h1 className="text-[32px] leading-[1.26] font-bold tracking-[-0.015em] text-primary-foreground">
          Công Ty TNHH Cơ Khí
          <br />
          Khuôn Mẫu <span className="text-[#ff8a4c]">Tiến Huy</span>
        </h1>
        <p className="mt-6 max-w-[370px] text-[15px] leading-[1.6] text-pretty text-primary-foreground/80">
          Tối ưu vận hành sản xuất bằng dữ liệu chính xác và quy trình có kiểm
          soát.
        </p>
      </div>

      <div className="flex items-center gap-[7px]">
        <span className="block h-[3px] w-7 rounded-[2px] bg-primary-foreground/95" />
        <span className="block h-[3px] w-3 rounded-[2px] bg-primary-foreground/35" />
        <span className="block h-[3px] w-3 rounded-[2px] bg-primary-foreground/35" />
      </div>
    </aside>
  )
}
