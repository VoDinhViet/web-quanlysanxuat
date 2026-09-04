import { useField } from "@tanstack/react-form"
import { Lightbulb, Ruler } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { useOqcAqlVerdict } from "@/features/oqc/hooks/use-oqc-aql-verdict"
import type { OqcDetailFormApi } from "@/features/oqc/components/sections/OqcDetailForm"
import { IqcResult } from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"

type OqcAqlTallyStripProps = {
  form: OqcDetailFormApi
  quantity: number
  disabled?: boolean
}

// Chữ ký của trang — 1 hàng ô vuông thay bảng Ac/Re bằng chữ: ô 0..Ac tô success, ô Re tô
// destructive, tô đặc dần theo `defectQty` đang gõ. Đây chính là bảng lấy mẫu ISO 2859-1 mà QC
// vẫn tick tay, chỉ khác là sống theo input. Thay OqcAqlPlanPanel.tsx cũ (chỉ có prose tĩnh).
export function OqcAqlTallyStrip({
  form,
  quantity,
  disabled,
}: OqcAqlTallyStripProps) {
  const { plan, verdict } = useOqcAqlVerdict(form, quantity)
  const defectQty = useField({ form, name: "defectQty" }).state.value

  if (!plan) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border bg-muted/20 px-3.5 py-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Chọn Inspection Level và AQL Level để xem bảng đối chiếu Ac/Re — chỉ
          mang tính tham khảo, không bắt buộc theo.
        </p>
      </div>
    )
  }

  const acIndices = Array.from({ length: plan.ac + 1 }, (_, index) => index)
  const overflow =
    defectQty !== undefined ? Math.max(0, defectQty - plan.re) : 0

  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-muted/20 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <Ruler className="size-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground">Bảng AQL</span>
          <span className="font-mono text-muted-foreground tabular-nums">
            code {plan.codeLetter} · n {plan.sampleSize} · Ac {plan.ac} / Re{" "}
            {plan.re}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[11px]"
          isDisabled={disabled}
          onPress={() => form.setFieldValue("sampleSize", plan.sampleSize)}
        >
          Dùng gợi ý
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {acIndices.map((index) => (
            <TallyBox
              key={index}
              index={index}
              filled={defectQty !== undefined && defectQty > index}
              tone="success"
            />
          ))}
          <span className="mx-0.5 h-6 w-px shrink-0 bg-border" />
          <TallyBox
            index={plan.re}
            filled={defectQty !== undefined && defectQty >= plan.re}
            tone="destructive"
          />
        </div>
        {overflow > 0 && (
          <span className="font-mono text-[11px] font-semibold text-destructive tabular-nums">
            +{overflow}
          </span>
        )}
      </div>

      {defectQty === undefined ? (
        <p className="text-xs text-muted-foreground">
          Nhập số lượng NG để đối chiếu với bảng Ac/Re.
        </p>
      ) : (
        <p
          className={cn(
            "text-xs font-medium",
            verdict === IqcResult.PASS ? "text-success" : "text-destructive"
          )}
        >
          {verdict === IqcResult.PASS
            ? `ĐẠT — ${defectQty}/${plan.ac} lỗi cho phép`
            : `KHÔNG ĐẠT — ${defectQty}/${plan.re} lỗi, vượt ngưỡng chấp nhận`}
        </p>
      )}
    </div>
  )
}

type TallyBoxProps = {
  index: number
  filled: boolean
  tone: "success" | "destructive"
}

const tallyBoxTones = {
  success: {
    filled: "border-success bg-success/15 text-success",
    empty: "border-border text-muted-foreground/60",
  },
  destructive: {
    filled: "border-destructive bg-destructive/15 text-destructive",
    empty: "border-destructive/40 text-destructive/50",
  },
} as const

function TallyBox({ index, filled, tone }: TallyBoxProps) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-md border font-mono text-[10px] font-semibold tabular-nums",
        tallyBoxTones[tone][filled ? "filled" : "empty"]
      )}
    >
      {index}
    </span>
  )
}
