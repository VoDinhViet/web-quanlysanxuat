import { Search } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  GalleryRow,
  GallerySection,
} from "@/features/ui-gallery/components/GallerySection"

const statusOptions = [
  { value: "open", label: "Chờ phân tích" },
  { value: "approved", label: "Đã duyệt" },
  { value: "closed", label: "Đã đóng" },
]

export function GalleryFormSection() {
  return (
    <GallerySection
      id="form"
      title="Biểu mẫu"
      description="Input, Textarea, Select, Checkbox, Switch, Radio, Field, InputGroup"
    >
      <GalleryRow label="Input · trạng thái">
        <Input className="w-56" placeholder="Mặc định" />
        <Input className="w-56" defaultValue="Có giá trị" />
        <Input className="w-56" placeholder="Disabled" disabled />
        <Input className="w-56" defaultValue="Không hợp lệ" aria-invalid />
      </GalleryRow>

      <GalleryRow label="Field có nhãn / mô tả / lỗi">
        <Field className="w-64">
          <FieldLabel htmlFor="gallery-field">Tên sản phẩm</FieldLabel>
          <Input id="gallery-field" placeholder="Nhập tên sản phẩm" />
          <FieldDescription>Hiển thị trên phiếu in.</FieldDescription>
        </Field>
        <Field className="w-64" data-invalid>
          <FieldLabel htmlFor="gallery-field-error">Số lượng</FieldLabel>
          <Input id="gallery-field-error" defaultValue="-1" aria-invalid />
          <FieldError>Số lượng phải lớn hơn 0</FieldError>
        </Field>
      </GalleryRow>

      <GalleryRow label="InputGroup">
        <InputGroup className="w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Tìm kiếm…" />
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupInput defaultValue="1000" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>VNĐ</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </GalleryRow>

      <GalleryRow label="Textarea">
        <Textarea className="w-80" placeholder="Mô tả lỗi…" />
        <Textarea className="w-80" aria-invalid defaultValue="Không hợp lệ" />
      </GalleryRow>

      <GalleryRow label="Select">
        <Select items={statusOptions} defaultValue="open">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={statusOptions} disabled defaultValue="closed">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </GalleryRow>

      <GalleryRow label="Checkbox · Switch · Radio">
        <div className="flex items-center gap-2">
          <Checkbox id="gallery-check" defaultChecked />
          <Label htmlFor="gallery-check">Đã chọn</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="gallery-check-off" />
          <Label htmlFor="gallery-check-off">Chưa chọn</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="gallery-check-disabled" disabled />
          <Label htmlFor="gallery-check-disabled">Disabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="gallery-switch" defaultChecked />
          <Label htmlFor="gallery-switch">Bật</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="gallery-switch-off" />
          <Label htmlFor="gallery-switch-off">Tắt</Label>
        </div>
        <RadioGroup defaultValue="a" className="flex gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="a" id="gallery-radio-a" />
            <Label htmlFor="gallery-radio-a">Sửa chữa</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="b" id="gallery-radio-b" />
            <Label htmlFor="gallery-radio-b">Làm mới</Label>
          </div>
        </RadioGroup>
      </GalleryRow>
    </GallerySection>
  )
}
