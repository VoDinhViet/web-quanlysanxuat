export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// Server function là trust boundary duy nhất (architecture.md) nên byte nhị phân từ backend phải
// về client dưới dạng base64 qua RPC — hàm này decode lại thành Blob rồi kích hoạt tải, thay cho
// mở thẳng URL backend (sẽ thiếu Bearer).
export function downloadBase64File(
  base64: string,
  filename: string,
  mimeType: string
): void {
  const byteString = atob(base64)
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }

  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
