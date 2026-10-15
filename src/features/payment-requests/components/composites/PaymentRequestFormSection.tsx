import type { ReactNode } from "react"

type PaymentRequestFormSectionProps = {
  title: string
  description: string
  children: ReactNode
}

// Mục nhập liệu trong chi tiết YCTT: tiêu đề + mô tả ngắn, các mục cách nhau bằng đường kẻ
// (không dùng khung viền để tránh card lồng card).
export function PaymentRequestFormSection({
  title,
  description,
  children,
}: PaymentRequestFormSectionProps) {
  return (
    <section className="min-w-0 space-y-3 border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
      <header className="space-y-0.5">
        <h4 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
          <span aria-hidden className="h-3.5 w-1 rounded-full bg-primary" />
          {title}
        </h4>
        <p className="pl-3 text-[11px] text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  )
}
