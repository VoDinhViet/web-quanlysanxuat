import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "web-qlsx-start"

export const Bar = () => (
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>Tệp</MenubarTrigger>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Chỉnh sửa</MenubarTrigger>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Sản xuất</MenubarTrigger>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Báo cáo</MenubarTrigger>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Trợ giúp</MenubarTrigger>
    </MenubarMenu>
  </Menubar>
)
