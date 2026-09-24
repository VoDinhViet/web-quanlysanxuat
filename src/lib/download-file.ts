export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export const PDF_MIME_TYPE = "application/pdf"

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

export function printBase64Pdf(base64: string): void {
  const byteString = atob(base64)
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([bytes], { type: PDF_MIME_TYPE })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  iframe.src = url

  document.body.appendChild(iframe)

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch {
      window.open(url, "_blank")
    }

    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 60_000)
  }
}

