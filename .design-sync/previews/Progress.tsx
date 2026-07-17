import { Progress } from "web-qlsx-start"

export const Values = () => (
  <div className="flex w-full max-w-sm flex-col gap-4">
    <div className="grid gap-1.5">
      <div className="flex justify-between text-sm">
        <span>LSX-2026-0341 — Trục cán thép</span>
        <span className="text-muted-foreground">25%</span>
      </div>
      <Progress value={25} />
    </div>
    <div className="grid gap-1.5">
      <div className="flex justify-between text-sm">
        <span>LSX-2026-0338 — Bánh răng côn</span>
        <span className="text-muted-foreground">60%</span>
      </div>
      <Progress value={60} />
    </div>
    <div className="grid gap-1.5">
      <div className="flex justify-between text-sm">
        <span>LSX-2026-0329 — Khung băng tải</span>
        <span className="text-muted-foreground">100%</span>
      </div>
      <Progress value={100} />
    </div>
  </div>
)
