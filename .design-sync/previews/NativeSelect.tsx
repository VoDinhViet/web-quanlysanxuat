import { Label, NativeSelect, NativeSelectOption } from "web-qlsx-start"

export const Basic = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="workshop">Xưởng sản xuất</Label>
    <NativeSelect id="workshop" defaultValue="a">
      <NativeSelectOption value="a">Xưởng A — Gia công cơ khí</NativeSelectOption>
      <NativeSelectOption value="b">Xưởng B — Lắp ráp</NativeSelectOption>
      <NativeSelectOption value="c">Xưởng C — Sơn &amp; hoàn thiện</NativeSelectOption>
    </NativeSelect>
  </div>
)

export const Disabled = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="workshop-locked" className="opacity-50">
      Xưởng (đã khóa)
    </Label>
    <NativeSelect id="workshop-locked" disabled defaultValue="a">
      <NativeSelectOption value="a">Xưởng A — Gia công cơ khí</NativeSelectOption>
    </NativeSelect>
  </div>
)
