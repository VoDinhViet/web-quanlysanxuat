export function getFilenameFromContentDisposition(
  disposition: string | undefined,
  fallback: string
): string {
  return /filename="?([^"]+)"?/.exec(disposition ?? "")?.[1] ?? fallback
}

export function arrayBufferToBase64(data: ArrayBuffer): string {
  return Buffer.from(data).toString("base64")
}
