import { DateTime } from "luxon"

/** Ô nhập để trống nghĩa là "không nhập" — payload bỏ hẳn key thay vì gửi chuỗi rỗng. */
export function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
}

/** Bản số của `emptyToUndefined` — dùng cho input số nhập bằng chuỗi. */
export function emptyToUndefinedNumber(value: string): number | undefined {
  return value.length > 0 ? Number(value) : undefined
}

/**
 * Chuỗi date-only (yyyy-MM-dd) từ date picker → ISO datetime.
 * Bắt buộc `{zone:"utc"}`: parse ở zone local (+07:00) rồi đọc lại theo UTC sẽ lệch 1 ngày.
 */
export function toIsoDate(value: string): string {
  return DateTime.fromISO(value, { zone: "utc" }).toJSDate().toISOString()
}

/** Bản optional của `toIsoDate` cho ô ngày không bắt buộc. */
export function emptyToUndefinedIsoDate(value: string): string | undefined {
  return value.length > 0 ? toIsoDate(value) : undefined
}
