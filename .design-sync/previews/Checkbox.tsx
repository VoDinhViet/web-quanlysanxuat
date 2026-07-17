import { Checkbox, Label } from "web-qlsx-start"

export const States = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Checkbox id="cb-unchecked" />
      <Label htmlFor="cb-unchecked">Gia công CNC</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-checked" defaultChecked />
      <Label htmlFor="cb-checked">Sơn tĩnh điện</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-disabled" disabled />
      <Label htmlFor="cb-disabled" className="opacity-50">
        Mạ kẽm (tạm ngưng)
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-disabled-checked" disabled defaultChecked />
      <Label htmlFor="cb-disabled-checked" className="opacity-50">
        Kiểm tra chất lượng (bắt buộc)
      </Label>
    </div>
  </div>
)

export const FilterList = () => (
  <div className="flex w-64 flex-col gap-2 rounded-lg border p-4">
    <p className="text-sm font-medium">Trạng thái lệnh sản xuất</p>
    <div className="flex items-center gap-2">
      <Checkbox id="f-new" defaultChecked />
      <Label htmlFor="f-new">Mới tạo</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="f-progress" defaultChecked />
      <Label htmlFor="f-progress">Đang sản xuất</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="f-done" />
      <Label htmlFor="f-done">Hoàn thành</Label>
    </div>
  </div>
)
