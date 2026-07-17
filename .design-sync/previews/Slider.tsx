import { Label, Slider } from "web-qlsx-start"

export const Values = () => (
  <div className="flex w-full max-w-sm flex-col gap-6">
    <div className="grid gap-3">
      <Label>Tiến độ hoàn thành: 60%</Label>
      <Slider defaultValue={[60]} max={100} step={5} />
    </div>
    <div className="grid gap-3">
      <Label>Khoảng dung sai (mm)</Label>
      <Slider defaultValue={[20, 80]} max={100} step={1} />
    </div>
    <div className="grid gap-3">
      <Label className="opacity-50">Không khả dụng</Label>
      <Slider defaultValue={[40]} max={100} disabled />
    </div>
  </div>
)
