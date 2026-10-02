import { useMemo, useRef, useState } from "react"
import { addMinutes, format, isValid, parseISO, setHours, setMinutes } from "date-fns"
import { CalendarIcon, Check, Clock, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type DateTimePickerProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
)

const MINUTE_STEPS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]

const PRESET_TIMES = [
  { label: "08:00", hour: 8, minute: 0 },
  { label: "10:00", hour: 10, minute: 0 },
  { label: "13:30", hour: 13, minute: 30 },
  { label: "17:00", hour: 17, minute: 0 },
]

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "dd/mm/yyyy hh:mm",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const hourInputRef = useRef<HTMLInputElement>(null)
  const minuteInputRef = useRef<HTMLInputElement>(null)

  const selectedDate = useMemo(() => {
    if (!value || value.trim().length === 0) return undefined
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  }, [value])

  const [prevValue, setPrevValue] = useState(value)
  const [hourInput, setHourInput] = useState<string>(() =>
    selectedDate ? format(selectedDate, "HH") : ""
  )
  const [minuteInput, setMinuteInput] = useState<string>(() =>
    selectedDate ? format(selectedDate, "mm") : ""
  )

  if (prevValue !== value) {
    setPrevValue(value)
    if (selectedDate) {
      setHourInput(format(selectedDate, "HH"))
      setMinuteInput(format(selectedDate, "mm"))
    } else {
      setHourInput("")
      setMinuteInput("")
    }
  }

  const currentHour = selectedDate ? format(selectedDate, "HH") : ""
  const currentMinute = selectedDate ? format(selectedDate, "mm") : ""

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const baseDate = selectedDate ?? new Date()
    const newDate = setMinutes(
      setHours(date, baseDate.getHours()),
      baseDate.getMinutes()
    )
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleHourSelect = (hourStr: string) => {
    const h = parseInt(hourStr, 10)
    const baseDate = selectedDate ?? new Date()
    const newDate = setHours(baseDate, h)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    setHourInput(hourStr)
  }

  const handleMinuteSelect = (minuteStr: string) => {
    const m = parseInt(minuteStr, 10)
    const baseDate = selectedDate ?? new Date()
    const newDate = setMinutes(baseDate, m)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    setMinuteInput(minuteStr)
  }

  const handleAdjustMinute = (delta: number) => {
    const baseDate = selectedDate ?? new Date()
    const newDate = addMinutes(baseDate, delta)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    setMinuteInput(format(newDate, "mm"))
    setHourInput(format(newDate, "HH"))
  }

  const handleAdjustHour = (delta: number) => {
    const baseDate = selectedDate ?? new Date()
    const newDate = addMinutes(baseDate, delta * 60)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    setHourInput(format(newDate, "HH"))
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw === "") {
      setHourInput("")
      return
    }

    const trimmed = raw.slice(-2)
    const num = parseInt(trimmed, 10)
    if (num > 23) {
      const last = parseInt(trimmed.slice(-1), 10)
      setHourInput(last.toString().padStart(2, "0"))
      const baseDate = selectedDate ?? new Date()
      onChange(format(setHours(baseDate, last), "yyyy-MM-dd'T'HH:mm"))
      return
    }

    setHourInput(trimmed)
    const baseDate = selectedDate ?? new Date()
    onChange(format(setHours(baseDate, num), "yyyy-MM-dd'T'HH:mm"))

    // Khi gõ đủ 2 chữ số hoặc số đầu >= 3 (vì giờ tối đa là 23), tự nhảy sang ô phút
    if (trimmed.length === 2 || num >= 3) {
      minuteInputRef.current?.focus()
      minuteInputRef.current?.select()
    }
  }

  const handleHourBlur = () => {
    if (hourInput === "") {
      setHourInput(selectedDate ? format(selectedDate, "HH") : "00")
      return
    }
    const num = Math.min(23, Math.max(0, parseInt(hourInput, 10) || 0))
    setHourInput(num.toString().padStart(2, "0"))
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    if (raw === "") {
      setMinuteInput("")
      return
    }

    const trimmed = raw.slice(-2)
    const num = parseInt(trimmed, 10)
    if (num > 59) {
      const last = parseInt(trimmed.slice(-1), 10)
      setMinuteInput(last.toString().padStart(2, "0"))
      const baseDate = selectedDate ?? new Date()
      onChange(format(setMinutes(baseDate, last), "yyyy-MM-dd'T'HH:mm"))
      return
    }

    setMinuteInput(trimmed)
    const baseDate = selectedDate ?? new Date()
    onChange(format(setMinutes(baseDate, num), "yyyy-MM-dd'T'HH:mm"))
  }

  const handleMinuteBlur = () => {
    if (minuteInput === "") {
      setMinuteInput(selectedDate ? format(selectedDate, "mm") : "00")
      return
    }
    const num = Math.min(59, Math.max(0, parseInt(minuteInput, 10) || 0))
    setMinuteInput(num.toString().padStart(2, "0"))
  }

  const handleHourWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault()
    handleAdjustHour(e.deltaY < 0 ? 1 : -1)
  }

  const handleMinuteWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault()
    handleAdjustMinute(e.deltaY < 0 ? 1 : -1)
  }

  const handlePasteTime = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").trim()
    const match = text.match(/^(\d{1,2})[:\s-]?(\d{1,2})$/)
    if (match) {
      e.preventDefault()
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)))
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)))
      const baseDate = selectedDate ?? new Date()
      const newDate = setMinutes(setHours(baseDate, h), m)
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
      setHourInput(h.toString().padStart(2, "0"))
      setMinuteInput(m.toString().padStart(2, "0"))
    }
  }

  const handlePresetSelect = (hour: number, minute: number) => {
    const baseDate = selectedDate ?? new Date()
    const newDate = setMinutes(setHours(baseDate, hour), minute)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleSetNow = () => {
    const now = new Date()
    onChange(format(now, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleClear = () => {
    onChange("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) onBlur?.()
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between bg-background text-xs font-normal",
              !selectedDate && "text-muted-foreground",
              className
            )}
          >
            {selectedDate ? (
              <span>{format(selectedDate, "dd/MM/yyyy HH:mm")}</span>
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="w-auto p-0"
      >
        <div className="flex flex-col divide-y divide-border/50 sm:flex-row sm:divide-y-0 sm:divide-x sm:divide-border/50">
          {/* Lịch chọn ngày */}
          <div className="p-1 sm:p-2">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>

          {/* Phần chọn & nhập giờ trực quan (phẳng, phân tách bằng border mảnh) */}
          <div className="flex flex-col p-3 sm:w-[290px]">
            {/* Header thời gian & nút tăng giảm phút */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Giờ:</span>
                <div className="flex items-center gap-0.5 font-mono text-xs font-semibold">
                  <input
                    ref={hourInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={hourInput}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    onPaste={handlePasteTime}
                    onFocus={(e) => e.target.select()}
                    onWheel={handleHourWheel}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault()
                        handleAdjustHour(1)
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault()
                        handleAdjustHour(-1)
                      } else if (e.key === "ArrowRight") {
                        minuteInputRef.current?.focus()
                        minuteInputRef.current?.select()
                      }
                    }}
                    placeholder="00"
                    title="Gõ giờ (00-23), cuộn chuột hoặc phím Lên/Xuống"
                    className="h-7 w-8.5 rounded border border-border/60 bg-background text-center text-xs font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-muted-foreground font-bold">:</span>
                  <input
                    ref={minuteInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={minuteInput}
                    onChange={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    onPaste={handlePasteTime}
                    onFocus={(e) => e.target.select()}
                    onWheel={handleMinuteWheel}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault()
                        handleAdjustMinute(1)
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault()
                        handleAdjustMinute(-1)
                      } else if (e.key === "ArrowLeft") {
                        hourInputRef.current?.focus()
                        hourInputRef.current?.select()
                      }
                    }}
                    placeholder="00"
                    title="Gõ phút chính xác (00-59), cuộn chuột hoặc phím Lên/Xuống"
                    className="h-7 w-8.5 rounded border border-border/60 bg-background text-center text-xs font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Tinh chỉnh nhanh phút: -5, -1, +1, +5 */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 w-7 p-0 font-mono text-xs text-muted-foreground hover:text-foreground"
                  title="Giảm 5 phút"
                  onClick={() => handleAdjustMinute(-5)}
                >
                  -5
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="h-7 w-7 p-0 font-mono text-xs border-border/60 hover:bg-muted"
                  title="Giảm 1 phút"
                  onClick={() => handleAdjustMinute(-1)}
                >
                  -1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="h-7 w-7 p-0 font-mono text-xs border-border/60 hover:bg-muted"
                  title="Tăng 1 phút"
                  onClick={() => handleAdjustMinute(1)}
                >
                  +1
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 w-7 p-0 font-mono text-xs text-muted-foreground hover:text-foreground"
                  title="Tăng 5 phút"
                  onClick={() => handleAdjustMinute(5)}
                >
                  +5
                </Button>
              </div>
            </div>

            {/* Phím tắt mốc thời gian nhanh & Hiện tại */}
            <div className="flex items-center gap-1 py-2 border-b border-border/50">
              <button
                type="button"
                className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors select-none"
                onClick={handleSetNow}
                title="Đặt theo ngày & giờ hiện tại"
              >
                <Clock className="size-3 text-primary" />
                Hiện tại
              </button>
              {PRESET_TIMES.map((preset) => {
                const isPresetActive =
                  currentHour === preset.hour.toString().padStart(2, "0") &&
                  currentMinute === preset.minute.toString().padStart(2, "0")
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={cn(
                      "flex-1 rounded py-1 text-[11px] font-mono font-medium transition-colors select-none",
                      isPresetActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => handlePresetSelect(preset.hour, preset.minute)}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            {/* Lưới chọn Giờ (00 - 23: 4 hàng x 6 cột) */}
            <div className="py-2 border-b border-border/50">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Giờ (00 - 23)
                </span>
                {currentHour && (
                  <span className="font-mono text-[11px] font-semibold text-primary">
                    {currentHour}h
                  </span>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {HOURS.map((h) => {
                  const isSelected = currentHour === h
                  return (
                    <button
                      key={h}
                      type="button"
                      className={cn(
                        "flex h-6.5 items-center justify-center rounded font-mono text-xs transition-colors select-none",
                        isSelected
                          ? "bg-primary font-bold text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleHourSelect(h)}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Lưới chọn Phút (bước 5 phút: 2 hàng x 6 cột) */}
            <div className="pt-2">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Phút (bước 5p)
                </span>
                {currentMinute && (
                  <span className="font-mono text-[11px] font-semibold text-primary">
                    {currentMinute}p
                  </span>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {MINUTE_STEPS.map((m) => {
                  const isSelected = currentMinute === m
                  return (
                    <button
                      key={m}
                      type="button"
                      className={cn(
                        "flex h-6.5 items-center justify-center rounded font-mono text-xs transition-colors select-none",
                        isSelected
                          ? "bg-primary font-bold text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleMinuteSelect(m)}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Thanh công cụ dưới cùng: Tinh giản, thẳng hàng bên phải */}
        <div className="flex items-center justify-end gap-2 border-t border-border/50 bg-muted/20 px-3 py-2">
          {value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleClear}
            >
              <Trash2 className="size-3.5" />
              Xóa
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 px-4 text-xs font-medium shadow-xs"
            onClick={() => setOpen(false)}
          >
            <Check className="size-4" />
            Xong
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
