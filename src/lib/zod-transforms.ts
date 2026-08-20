import { DateTime } from "luxon"
import { z } from "zod"
import type { ZodString } from "zod"

// Wraps a string schema so "" is treated the same as not provided at all — the
// caller can pass a raw (possibly empty) string straight through instead of
// writing `value || undefined` itself. Constrained to ZodString (not a fully
// generic ZodType): the collapse-empty-to-undefined behavior is specifically
// string semantics. Several GET endpoints 422 on a present-but-empty query
// param, so this is load-bearing, not cosmetic — see get-client-options.ts.
export function optional<T extends ZodString>(schema: T) {
  return schema.transform((value) => value || undefined).optional()
}

// Wraps a native-enum schema so a <Select>'s "no choice" sentinel ("") collapses to
// undefined — mirrors `optional()` above but for z.enum(...) rather than ZodString.
export function optionalEnum<T extends Parameters<typeof z.enum>[0]>(
  enumObject: T
) {
  return z
    .union([z.enum(enumObject), z.literal("")])
    .transform((value) => (value === "" ? undefined : value))
}

/** The `null` counterpart of `optionalEnum()` for PATCH: an omitted key means "no change", so
 *  clearing a `<Select>` back to "" needs an explicit null on the wire. */
export function optionalEnumNullable<T extends Parameters<typeof z.enum>[0]>(
  enumObject: T
) {
  return z
    .union([z.enum(enumObject), z.literal("")])
    .transform((value) => (value === "" ? null : value))
}

/** Ô nhập để trống nghĩa là "không nhập" — payload bỏ hẳn key thay vì gửi chuỗi rỗng. */
export function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
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

/** Bản `null` của `emptyToUndefined` cho PATCH: thiếu key nghĩa là "không đổi", nên muốn
 *  xoá một ô không bắt buộc phải gửi hẳn `null` — xem orders/schemas/update-order.schema.ts. */
export function emptyToNull(value: string): string | null {
  return value.length > 0 ? value : null
}

/** Ô email không bắt buộc: ""→undefined rồi chỉ validate khi thực sự có giá trị. Dùng ở
 * cấp field thay cho `.superRefine(refineOptionalEmail(...))` cấp object — xem
 * users/schemas/create-user.schema.ts. */
export function optionalEmail() {
  return z
    .string()
    .trim()
    .transform(emptyToUndefined)
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "Email không đúng định dạng",
    })
}

/** Chỉ báo lỗi khi có giá trị (field email đã transform ""→undefined trước đó) — dùng
 * `.superRefine(refineOptionalEmail("email"))` (hoặc tên field khác, vd "contactEmail") trên
 * schema object đã có field đó. Dùng cho object cần refinement cấp object; nếu object đó
 * còn cần `.extend()` sau này, xem `optionalEmail()` ở trên. */
export function refineOptionalEmail<TFieldName extends string>(
  fieldName: TFieldName
) {
  return function (
    value: Record<TFieldName, string | undefined>,
    ctx: z.RefinementCtx
  ): void {
    const email = value[fieldName]

    if (email && !z.email().safeParse(email).success) {
      ctx.addIssue({
        code: "custom",
        path: [fieldName],
        message: "Email không đúng định dạng",
      })
    }
  }
}
