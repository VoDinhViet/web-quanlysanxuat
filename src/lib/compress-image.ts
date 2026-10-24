// Phone cameras produce 4–12MB photos; above this size an evidence photo is re-encoded before
// upload so it fits the backend's image cap and uploads quickly over the shop-floor wifi.
const COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024
const MAX_EDGE_PX = 2000
const JPEG_QUALITY = 0.85

// GIF would lose its animation; every other raster image is safe to flatten to JPEG.
export function isCompressibleImage(file: File): boolean {
  return file.type.startsWith("image/") && file.type !== "image/gif"
}

/**
 * Downscale a large photo to at most 2000px on its long edge as JPEG. Returns the original file
 * when it is small, not a compressible image, or the browser cannot decode or draw it.
 */
export async function compressImageIfLarge(file: File): Promise<File> {
  if (!isCompressibleImage(file) || file.size <= COMPRESS_THRESHOLD_BYTES) {
    return file
  }

  let bitmap: ImageBitmap | undefined
  try {
    // Re-encoding drops the EXIF orientation tag, so bake the rotation into the pixels.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const scale = Math.min(
      1,
      MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height)
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext("2d")
    if (!context) return file

    // JPEG has no alpha: a transparent PNG would otherwise come out on black.
    context.fillStyle = "#fff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    )
    if (!blob || blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, "")
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" })
  } catch {
    return file
  } finally {
    bitmap?.close()
  }
}
