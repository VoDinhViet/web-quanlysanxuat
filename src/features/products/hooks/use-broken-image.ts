import { useState } from "react"

// File đã upload nhưng bị dọn (orphan sweep/xoá) sẽ 404 khi hiển thị lại — track "ảnh vỡ" và tự
// reset về false khi đổi sang ảnh khác. "Adjusting state when a prop changes" theo khuyến nghị
// của React, không dùng effect vì compiler chặn setState đồng bộ trong effect. Dùng chung cho mọi
// nơi hiển thị ảnh có fallback (header thumbnail, sidebar preview) trong feature này.
export function useBrokenImage(
  imageId: string | undefined
): [isBroken: boolean, markBroken: () => void] {
  const [isBroken, setIsBroken] = useState(false)
  const [prevImageId, setPrevImageId] = useState(imageId)

  if (imageId !== prevImageId) {
    setPrevImageId(imageId)
    setIsBroken(false)
  }

  return [isBroken, () => setIsBroken(true)]
}
