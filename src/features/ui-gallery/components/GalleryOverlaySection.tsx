import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  GalleryRow,
  GallerySection,
} from "@/features/ui-gallery/components/GallerySection"

export function GalleryOverlaySection() {
  return (
    <GallerySection
      id="overlays"
      title="Lớp phủ"
      description="Dialog, AlertDialog, Sheet, Popover, Tooltip, DropdownMenu, HoverCard, Toast"
    >
      <GalleryRow label="Dialog · AlertDialog · Sheet">
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tiêu đề hộp thoại</DialogTitle>
              <DialogDescription>
                Mô tả ngắn về nội dung hộp thoại.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Huỷ</Button>
              <Button>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive">AlertDialog</Button>}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xoá bản ghi?</AlertDialogTitle>
              <AlertDialogDescription>
                Thao tác này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction>Xoá</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Sheet>
          <SheetTrigger render={<Button variant="outline">Sheet</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Tiêu đề Sheet</SheetTitle>
              <SheetDescription>Panel trượt từ cạnh phải.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </GalleryRow>

      <GalleryRow label="Popover · Tooltip · HoverCard · Toast">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Popover</Button>} />
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Tiêu đề</PopoverTitle>
              <PopoverDescription>Nội dung popover.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Tooltip</Button>} />
          <TooltipContent>Gợi ý ngắn</TooltipContent>
        </Tooltip>

        <HoverCard>
          <HoverCardTrigger
            render={<Button variant="outline">HoverCard</Button>}
          />
          <HoverCardContent>Thông tin hiện khi rê chuột.</HoverCardContent>
        </HoverCard>

        <Button variant="outline" onClick={() => toast.success("Đã lưu")}>
          Toast thành công
        </Button>
        <Button variant="outline" onClick={() => toast.error("Có lỗi xảy ra")}>
          Toast lỗi
        </Button>
      </GalleryRow>

      <GalleryRow label="DropdownMenu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Menu</Button>}
          />
          <DropdownMenuContent>
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Xoá</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </GalleryRow>
    </GallerySection>
  )
}
