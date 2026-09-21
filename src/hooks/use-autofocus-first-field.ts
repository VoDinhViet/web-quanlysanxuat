import { useEffect, useRef } from "react"
import type { RefObject } from "react"

const FOCUSABLE_SELECTOR =
  "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [role=combobox]:not([aria-disabled=true])"

/**
 * Tự focus ô nhập đầu tiên trong container khi mount — chỉ dùng cho màn
 * "Thêm mới", không dùng cho màn "Sửa". Chạy đúng 1 lần lúc mount, không
 * refocus khi container re-render. Với form nhiều bước, Radix Tabs unmount
 * panel không active nên selector chỉ thấy ô của bước đang hiện.
 */
export function useAutoFocusFirstField<
  T extends HTMLElement,
>(): RefObject<T | null> {
  const containerRef = useRef<T>(null)

  useEffect(() => {
    containerRef.current
      ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ?.focus()
  }, [])

  return containerRef
}
