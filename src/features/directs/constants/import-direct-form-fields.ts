import { BoxMinimalistic, InfoCircle, Settings } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { directImportFields } from "@/lib/types/direct.type"
import type {
  DirectImportField,
  DirectImportKey,
} from "@/lib/types/direct.type"

export type FieldGroup = {
  title: string
  description: string
  icon: ComponentType<IconProps>
  iconClassName: string
  keys: DirectImportKey[]
}

export const fieldGroups: FieldGroup[] = [
  {
    title: "Thông tin chính",
    description: "Mã, tên và đơn vị tính dùng để nhận diện vật tư.",
    icon: BoxMinimalistic,
    iconClassName: "text-primary",
    keys: [
      "code",
      "revision",
      "name",
      "unitCode",
      "supplierCode",
      "clientCode",
    ],
  },
  {
    title: "Thông số kỹ thuật",
    description: "Định mức tồn, trọng lượng, mác và quy cách của vật tư.",
    icon: Settings,
    iconClassName: "text-warning",
    keys: [
      "minStock",
      "specificWeight",
      "directGrade",
      "technicalStandard",
      "dimensions",
      "colorSurface",
    ],
  },
  {
    title: "Thông tin khác",
    description: "Xuất xứ, thời gian giao hàng, mô tả và ghi chú thêm.",
    icon: InfoCircle,
    iconClassName: "text-info",
    keys: ["origin", "leadTime", "description", "note"],
  },
]

export const placeholders: Record<DirectImportKey, string> = {
  code: "VD: VT0001",
  revision: "VD: R01",
  name: "VD: Thép tấm SS400",
  unitCode: "VD: KG",
  supplierCode: "Mã nhà cung cấp",
  clientCode: "Mã khách hàng",
  minStock: "VD: 100",
  specificWeight: "VD: 7.85",
  directGrade: "VD: SS400",
  technicalStandard: "VD: JIS G3101",
  dimensions: "VD: 2x1000x2000",
  colorSurface: "VD: Đen, mạ kẽm",
  origin: "VD: Việt Nam",
  leadTime: "VD: 7 ngày",
  description: "Mô tả chi tiết về vật tư (tối đa 2000 ký tự)",
  note: "Ghi chú thêm (tối đa 1000 ký tự)",
}

export const textareaKeys: DirectImportKey[] = ["description", "note"]

export const textareaMaxLength: Partial<Record<DirectImportKey, number>> = {
  description: 2000,
  note: 1000,
}

export function getImportField(key: DirectImportKey): DirectImportField {
  return (
    directImportFields.find((field) => field.key === key) ?? { key, label: key }
  )
}
