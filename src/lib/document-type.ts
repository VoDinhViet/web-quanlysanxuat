import type { LucideIcon } from "lucide-react"
import {
  File,
  FileArchive,
  FileAxis3d,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react"

export type DocumentTypeInfo = {
  icon: LucideIcon
  label: string
  typeName: string
}

/**
 * Nhận diện loại tài liệu trong môi trường sản xuất theo phong cách tối giản, tinh tế.
 */
export function getDocumentTypeInfo(
  mimetype: string,
  filename: string
): DocumentTypeInfo {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""

  // 1. Bản vẽ kỹ thuật CAD / Visio
  if (
    ext === "dwg" ||
    ext === "dxf" ||
    ext === "vsdx" ||
    mimetype === "image/vnd.dwg" ||
    mimetype.includes("visio")
  ) {
    return {
      icon: FileAxis3d,
      label: "CAD",
      typeName: "Bản vẽ CAD",
    }
  }

  // 2. Tài liệu PDF
  if (ext === "pdf" || mimetype === "application/pdf") {
    return {
      icon: FileText,
      label: "PDF",
      typeName: "Tài liệu PDF",
    }
  }

  // 3. Bảng tính Excel / BOM
  if (
    ext === "xlsx" ||
    ext === "xls" ||
    ext === "csv" ||
    ext === "xltx" ||
    ext === "ods" ||
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    mimetype.includes("csv")
  ) {
    return {
      icon: FileSpreadsheet,
      label: "XLS",
      typeName: "Bảng tính Excel",
    }
  }

  // 4. Văn bản Word
  if (
    ext === "docx" ||
    ext === "doc" ||
    ext === "dotx" ||
    ext === "odt" ||
    ext === "rtf" ||
    mimetype.includes("wordprocessingml") ||
    mimetype.includes("msword")
  ) {
    return {
      icon: FileType,
      label: "DOC",
      typeName: "Văn bản Word",
    }
  }

  // 5. Trình chiếu Slide
  if (
    ext === "pptx" ||
    ext === "ppt" ||
    ext === "odp" ||
    mimetype.includes("presentation") ||
    mimetype.includes("powerpoint")
  ) {
    return {
      icon: FileText,
      label: "PPT",
      typeName: "Trình chiếu",
    }
  }

  // 6. Tập tin nén
  if (
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar" ||
    ext === "gz" ||
    mimetype.includes("zip") ||
    mimetype.includes("compressed") ||
    mimetype.includes("archive")
  ) {
    return {
      icon: FileArchive,
      label: "ZIP",
      typeName: "Tập tin nén",
    }
  }

  // 7. Hình ảnh minh họa
  if (
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "png" ||
    ext === "webp" ||
    mimetype.startsWith("image/")
  ) {
    return {
      icon: FileImage,
      label: "IMG",
      typeName: "Hình ảnh",
    }
  }

  // Mặc định
  return {
    icon: File,
    label: ext ? ext.toUpperCase().slice(0, 4) : "FILE",
    typeName: "Tài liệu",
  }
}
