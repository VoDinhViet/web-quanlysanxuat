import { Label, Switch } from "web-qlsx-start"

export const States = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Switch id="sw-on" defaultChecked />
      <Label htmlFor="sw-on">Tự động cập nhật tiến độ</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="sw-off" />
      <Label htmlFor="sw-off">Gửi email khi hoàn thành</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="sw-disabled" disabled />
      <Label htmlFor="sw-disabled" className="opacity-50">
        Đồng bộ ERP (chưa kích hoạt)
      </Label>
    </div>
  </div>
)
