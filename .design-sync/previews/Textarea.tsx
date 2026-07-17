import { Label, Textarea } from "web-qlsx-start"

export const States = () => (
  <div className="grid w-full max-w-sm gap-4">
    <div className="grid gap-2">
      <Label htmlFor="note">Ghi chú kỹ thuật</Label>
      <Textarea
        id="note"
        defaultValue="Dung sai trục ±0,02mm. Nhiệt luyện đạt độ cứng 45–50 HRC trước khi mài tinh."
        rows={3}
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="note-empty">Yêu cầu bổ sung</Label>
      <Textarea id="note-empty" placeholder="Nhập yêu cầu bổ sung…" rows={2} />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="note-disabled" className="opacity-50">
        Ghi chú hệ thống
      </Label>
      <Textarea id="note-disabled" defaultValue="Tự động tạo bởi hệ thống." disabled rows={2} />
    </div>
  </div>
)
