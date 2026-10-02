import { z } from "zod"

import { IMPORT_MAX_ROWS } from "@/features/directs/constants/import-direct-template"
import { emptyToUndefined } from "@/lib/zod-transforms"

function requiredText(max: number) {
  return z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .max(max, `Tối đa ${max} ký tự`)
}

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Tối đa ${max} ký tự`)
    .transform(emptyToUndefined)
}

function parseCellNumber(value: string): number {
  return Number(value.replace(/,/g, ""))
}

const optionalNumber = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (Number.isFinite(parseCellNumber(value)) && parseCellNumber(value) >= 0),
    "Phải là số không âm"
  )
  .transform((value) => (value === "" ? undefined : parseCellNumber(value)))

// One Excel row as the user edits it (all cells are strings). Limits mirror the backend's
// ITEM_IMPORT_FIELDS; the parsed output is already the wire shape for POST /api/items/import.
export const importDirectRowSchema = z.object({
  code: requiredText(50),
  revision: optionalText(50),
  name: requiredText(255),
  unitCode: requiredText(50),
  supplierCode: optionalText(50),
  clientCode: optionalText(50),
  minStock: optionalNumber,
  specificWeight: optionalNumber,
  directGrade: optionalText(255),
  technicalStandard: optionalText(255),
  dimensions: optionalText(255),
  colorSurface: optionalText(255),
  origin: optionalText(255),
  leadTime: optionalText(100),
  description: optionalText(2000),
  note: optionalText(1000),
})

export const importDirectsSchema = z.object({
  rows: z
    .array(importDirectRowSchema.extend({ rowNumber: z.number().int() }))
    .min(1, "Không có dòng nào để nhập")
    .max(IMPORT_MAX_ROWS, `Tối đa ${IMPORT_MAX_ROWS} dòng`),
})

export type ImportDirectsInput = z.output<typeof importDirectsSchema>
