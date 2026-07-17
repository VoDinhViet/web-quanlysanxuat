import { Kbd, KbdGroup } from "web-qlsx-start"

export const Single = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Kbd>Ctrl</Kbd>
    <Kbd>Shift</Kbd>
    <Kbd>Enter</Kbd>
    <Kbd>Esc</Kbd>
  </div>
)

export const Shortcuts = () => (
  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
    <div className="flex items-center gap-2">
      Tìm kiếm nhanh
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
    <div className="flex items-center gap-2">
      Lưu lệnh sản xuất
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </KbdGroup>
    </div>
  </div>
)
