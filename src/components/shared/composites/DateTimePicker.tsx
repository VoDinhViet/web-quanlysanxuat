import { useMemo, useState } from "react"
import { addMinutes, format, isValid, parseISO, setHours, setMinutes } from "date-fns"
import { CalendarIcon, ChevronDown, Clock } from "lucide-react"

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
  placeholder = "Chọn ngày & giờ...",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const selectedDate = useMemo(() => {
    if (!value || value.trim().length === 0) return undefined
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  }, [value])

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
  }

  const handleMinuteSelect = (minuteStr: string) => {
    const m = parseInt(minuteStr, 10)
    const baseDate = selectedDate ?? new Date()
    const newDate = setMinutes(baseDate, m)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleAdjustMinute = (delta: number) => {
    const baseDate = selectedDate ?? new Date()
    const newDate = addMinutes(baseDate, delta)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleAdjustHour = (delta: number) => {
    const baseDate = selectedDate ?? new Date()
    const newDate = addMinutes(baseDate, delta * 60)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    if (raw === "") return
    const num = parseInt(raw, 10)
    if (num >= 0 && num <= 23) {
      const baseDate = selectedDate ?? new Date()
      onChange(format(setHours(baseDate, num), "yyyy-MM-dd'T'HH:mm"))
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    if (raw === "") return
    const num = parseInt(raw, 10)
    if (num >= 0 && num <= 59) {
      const baseDate = selectedDate ?? new Date()
      onChange(format(setMinutes(baseDate, num), "yyyy-MM-dd'T'HH:mm"))
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
              "h-9 w-full justify-between bg-background text-xs font-normal transition-all hover:border-ring/50",
              !selectedDate && "text-muted-foreground",
              className
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="size-4 shrink-0 text-primary" />
              {selectedDate ? (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span>{format(selectedDate, "dd/MM/yyyy")}</span>
                  <span className="inline-flex items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    <Clock className="size-3" />
                    {format(selectedDate, "HH:mm")}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/70" />
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

          {/* Phần chọn giờ trực quan (phẳng, phân tách bằng border mảnh) */}
          <div className="flex flex-col p-3 sm:w-[280px]">
            {/* Header thời gian & nút tăng giảm phút */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thời gian:</span>
                <div className="flex items-center gap-0.5 font-mono text-xs font-semibold">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={currentHour}
                    onChange={handleHourChange}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault()
                        handleAdjustHour(1)
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault()
                        handleAdjustHour(-1)
                      }
                    }}
                    placeholder="00"
                    title="Gõ giờ (00-23) hoặc phím Lên/Xuống"
                    className="h-6 w-7 rounded border border-border/60 bg-background text-center text-xs font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-muted-foreground font-bold">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={currentMinute}
                    onChange={handleMinuteChange}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault()
                        handleAdjustMinute(1)
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault()
                        handleAdjustMinute(-1)
                      }
                    }}
                    placeholder="00"
                    title="Gõ phút chính xác (00-59) hoặc phím Lên/Xuống"
                    className="h-6 w-7 rounded border border-border/60 bg-background text-center text-xs font-semibold text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Tinh chỉnh từng phút */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="h-6 w-7 p-0 font-mono text-[11px] border-border/60 hover:bg-muted"
                  title="Giảm 1 phút"
                  onClick={() => handleAdjustMinute(-1)}
                >
                  -1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="h-6 w-7 p-0 font-mono text-[11px] border-border/60 hover:bg-muted"
                  title="Tăng 1 phút"
                  onClick={() => handleAdjustMinute(1)}
                >
                  +1
                </Button>
              </div>
            </div>

            {/* Phím tắt ca làm việc nhanh */}
            <div className="flex items-center gap-1 py-2 border-b border-border/50">
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

        {/* Thanh công cụ dưới cùng: tinh giản, thanh thoát */}
        <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
            onClick={handleSetNow}
          >
            Hiện tại
          </Button>
          <div className="flex items-center gap-1.5">
            {value.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleClear}
              >
                Xóa
              </Button>
            )}
            <Button
              type="button"
              size="xs"
              className="h-7 px-3 text-xs font-medium"
              onClick={() => setOpen(false)}
            >
              Xong
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
