// Chỉ khai báo đúng phần getStepNav thật sự đọc. Mỗi feature giữ StepItem riêng (thêm
// `label`/`icon`) — 6 wizard đang dùng 2 thư viện icon khác nhau (@solar-icons/react's IconProps
// và lucide-react's LucideProps), src/lib không nên phụ thuộc thư viện nào cả. Kiểu StepItem của
// feature tự thoả cấu trúc này nên truyền thẳng vào được, không cần ép kiểu.
export type WizardStepNavItem<TStep extends string> = {
  value: TStep
  // Nhãn nút khi ĐANG ĐỨNG ở bước này (không phải nhãn của bước được trỏ tới).
  prevLabel?: string
  nextLabel?: string
}

export type WizardStepNav<TStep extends string> = {
  prevStep?: TStep
  prevLabel?: string
  nextStep?: TStep
  nextLabel?: string
}

// Suy prevStep/nextStep từ vị trí trong mảng thay vì một bảng Record trỏ tay — chèn/đổi thứ tự
// bước chỉ còn sửa đúng 1 chỗ (thứ tự phần tử), không thể lệch prevStep/nextStep như bảng cũ.
export function getStepNav<TStep extends string>(
  steps: WizardStepNavItem<TStep>[],
  currentStep: TStep
): WizardStepNav<TStep> {
  const index = steps.findIndex((step) => step.value === currentStep)
  // `currentStep` thuộc đúng union mà `steps` khai báo nên index luôn hợp lệ.
  const current = steps[index]

  return {
    // Không viết `steps[index - 1]?.value`: tsconfig không bật noUncheckedIndexedAccess nên TS
    // coi truy cập ngoặc vuông luôn ra giá trị, `?.` sẽ bị @typescript-eslint/no-unnecessary-
    // condition (từ @tanstack/eslint-config) chặn. Kiểm tra biên tường minh thay thế.
    prevStep: index > 0 ? steps[index - 1].value : undefined,
    prevLabel: current.prevLabel,
    nextStep: index < steps.length - 1 ? steps[index + 1].value : undefined,
    nextLabel: current.nextLabel,
  }
}
