// Đổi số nguyên (VND) sang chữ tiếng Việt — dùng cho dòng "Bằng chữ:" trên chứng từ in
// (PaymentRequestPrintSheet.tsx). Cách đọc theo chuẩn kế toán: nhóm 3 chữ số một, điền "không
// trăm" cho các nhóm sau nhóm đầu tiên khác 0, "linh" trước hàng đơn vị khi hàng chục = 0 (trừ
// nhóm dẫn đầu), "mười"/"mươi" cho hàng chục, và 3 ngoại lệ hàng đơn vị: "mốt" (1), "tư" (4),
// "lăm" (5) khi hàng chục >= 1 (10-19 chỉ đổi "một"→"mốt" không áp dụng — xem readThreeDigits).

const digitWords = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
]

// `needFullFormat`: false chỉ cho nhóm 3 chữ số có nghĩa đầu tiên (cao nhất, khác 0) — nhóm đó
// đọc "rút gọn" (5 → "năm", không phải "không trăm linh năm"); mọi nhóm sau đều cần đọc đủ.
function readThreeDigits(value: number, needFullFormat: boolean): string {
  const hundreds = Math.floor(value / 100)
  const tens = Math.floor((value % 100) / 10)
  const ones = value % 10
  const parts: string[] = []

  if (hundreds > 0) {
    parts.push(`${digitWords[hundreds]} trăm`)
  } else if (needFullFormat) {
    parts.push("không trăm")
  }

  if (tens === 0) {
    if (ones > 0) {
      parts.push(
        hundreds > 0 || needFullFormat
          ? `linh ${digitWords[ones]}`
          : digitWords[ones]
      )
    }
  } else if (tens === 1) {
    parts.push("mười")
    if (ones === 1) parts.push("một")
    else if (ones === 5) parts.push("lăm")
    else if (ones > 0) parts.push(digitWords[ones])
  } else {
    parts.push(`${digitWords[tens]} mươi`)
    if (ones === 1) parts.push("mốt")
    else if (ones === 4) parts.push("tư")
    else if (ones === 5) parts.push("lăm")
    else if (ones > 0) parts.push(digitWords[ones])
  }

  return parts.join(" ")
}

// Chu kỳ tên đơn vị lặp mỗi 3 nhóm: "", "nghìn", "triệu", rồi "tỷ" nối thêm mỗi 3 nhóm tiếp theo
// ("tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ", ...) — đủ cho mọi giá trị VND thực tế của một YCTT.
const baseScaleWords = ["", "nghìn", "triệu"]

function scaleWordForGroup(groupIndex: number): string {
  const parts: string[] = []
  const base = baseScaleWords[groupIndex % 3]

  if (base) parts.push(base)
  for (let i = 0; i < Math.floor(groupIndex / 3); i++) parts.push("tỷ")

  return parts.join(" ")
}

// Tách số nguyên dương thành các nhóm 3 chữ số, từ thấp lên cao (groups[0] = hàng đơn vị).
function splitIntoGroups(value: number): number[] {
  const groups: number[] = []
  let remaining = value

  do {
    groups.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  } while (remaining > 0)

  return groups
}

export function toVietnameseCurrencyWords(amount: number): string {
  const rounded = Math.round(amount)

  if (rounded === 0) {
    return "Không đồng"
  }

  const absolute = Math.abs(rounded)
  const groups = splitIntoGroups(absolute)
  const words: string[] = []
  let leadingGroupFound = false

  for (let index = groups.length - 1; index >= 0; index--) {
    const groupValue = groups[index]

    if (groupValue === 0) {
      continue
    }

    words.push(readThreeDigits(groupValue, leadingGroupFound))

    const scaleWord = scaleWordForGroup(index)
    if (scaleWord) words.push(scaleWord)

    leadingGroupFound = true
  }

  const sentence = `${words.join(" ")} đồng`

  return rounded < 0
    ? `Âm ${sentence}`
    : sentence.charAt(0).toUpperCase() + sentence.slice(1)
}
