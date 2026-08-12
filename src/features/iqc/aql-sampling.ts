import type { IqcInspectionLevel } from "@/lib/types/iqc.type"

// Bản sao client-side của be-quanlysanxuat's src/api/iqc/iqc-aql.constant.ts — chỉ dùng để xem
// trước (preview) khi user đang chỉnh input ở IqcAqlInputCard; kết quả xác nhận thật luôn do
// server tính lại (POST /iqc/:iqcId/confirm). Sửa 2 bảng dưới đây thì nhớ sửa cả bản backend.
type LotSizeRange = { max: number } & Record<IqcInspectionLevel, string>

const LOT_SIZE_CODE_LETTER: LotSizeRange[] = [
  { max: 8, I: "A", II: "A", III: "B" },
  { max: 15, I: "A", II: "B", III: "C" },
  { max: 25, I: "B", II: "C", III: "D" },
  { max: 50, I: "C", II: "D", III: "E" },
  { max: 90, I: "C", II: "E", III: "F" },
  { max: 150, I: "D", II: "F", III: "G" },
  { max: 280, I: "E", II: "G", III: "H" },
  { max: 500, I: "F", II: "H", III: "J" },
  { max: 1200, I: "G", II: "J", III: "K" },
  { max: 3200, I: "H", II: "K", III: "L" },
  { max: 10000, I: "J", II: "L", III: "M" },
  { max: 35000, I: "K", II: "M", III: "N" },
  { max: 150000, I: "L", II: "N", III: "P" },
  { max: 500000, I: "M", II: "P", III: "Q" },
  { max: Infinity, I: "N", II: "Q", III: "R" },
]

type SamplingPlan = { n: number; acRe: Record<number, [number, number]> }

const SAMPLING_PLAN: Record<string, SamplingPlan> = {
  B: { n: 3, acRe: { 1.0: [0, 1], 1.5: [0, 1], 2.5: [0, 1] } },
  C: { n: 5, acRe: { 1.0: [0, 1], 1.5: [0, 1], 2.5: [1, 2] } },
  D: { n: 8, acRe: { 1.0: [0, 1], 1.5: [1, 2], 2.5: [1, 2] } },
  F: { n: 20, acRe: { 1.0: [1, 2], 1.5: [2, 3], 2.5: [3, 4] } },
  G: { n: 32, acRe: { 1.0: [2, 3], 1.5: [3, 4], 2.5: [5, 6] } },
  H: { n: 50, acRe: { 1.0: [3, 4], 1.5: [5, 6], 2.5: [7, 8] } },
  J: { n: 80, acRe: { 1.0: [5, 6], 1.5: [7, 8], 2.5: [10, 11] } },
  K: { n: 125, acRe: { 1.0: [7, 8], 1.5: [10, 11], 2.5: [14, 15] } },
}

export type AqlPlan = {
  codeLetter: string
  sampleSize: number
  ac: number
  re: number
}

export function resolveAqlPlan(
  lotSize: number,
  level: IqcInspectionLevel,
  aql: number
): AqlPlan | undefined {
  const range = LOT_SIZE_CODE_LETTER.find((row) => lotSize <= row.max)
  const codeLetter = range?.[level]
  const plan = codeLetter ? SAMPLING_PLAN[codeLetter] : undefined
  const acRe = plan?.acRe[aql]

  if (!codeLetter || !plan || !acRe) {
    return undefined
  }

  return { codeLetter, sampleSize: plan.n, ac: acRe[0], re: acRe[1] }
}
