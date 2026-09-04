import { describe, expect, it } from "vitest"

import { toVietnameseCurrencyWords } from "@/lib/vietnamese-number-words"

describe("toVietnameseCurrencyWords", () => {
  it("reads zero", () => {
    expect(toVietnameseCurrencyWords(0)).toBe("Không đồng")
  })

  it("reads a single digit without a leading 'linh'", () => {
    expect(toVietnameseCurrencyWords(5)).toBe("Năm đồng")
  })

  it("reads teens with 'mười' instead of 'một mươi'", () => {
    expect(toVietnameseCurrencyWords(11)).toBe("Mười một đồng")
    expect(toVietnameseCurrencyWords(15)).toBe("Mười lăm đồng")
  })

  it("applies the 'mốt'/'tư'/'lăm' tens exceptions", () => {
    expect(toVietnameseCurrencyWords(21)).toBe("Hai mươi mốt đồng")
    expect(toVietnameseCurrencyWords(24)).toBe("Hai mươi tư đồng")
    expect(toVietnameseCurrencyWords(25)).toBe("Hai mươi lăm đồng")
  })

  it("reads a round hundred without a trailing zero", () => {
    expect(toVietnameseCurrencyWords(100)).toBe("Một trăm đồng")
  })

  it("inserts 'linh' before a bare ones digit within a hundred", () => {
    expect(toVietnameseCurrencyWords(105)).toBe("Một trăm linh năm đồng")
  })

  it("skips a zero group in the middle without saying it", () => {
    expect(toVietnameseCurrencyWords(1000000)).toBe("Một triệu đồng")
  })

  it("fills 'không trăm' for a non-leading group that has no hundreds", () => {
    expect(toVietnameseCurrencyWords(1005)).toBe(
      "Một nghìn không trăm linh năm đồng"
    )
    expect(toVietnameseCurrencyWords(1000005)).toBe(
      "Một triệu không trăm linh năm đồng"
    )
  })

  it("reads a realistic payment request amount", () => {
    expect(toVietnameseCurrencyWords(152400000)).toBe(
      "Một trăm năm mươi hai triệu bốn trăm nghìn đồng"
    )
  })

  it("rounds a fractional amount before reading it", () => {
    expect(toVietnameseCurrencyWords(999.6)).toBe("Một nghìn đồng")
  })

  it("prefixes a negative amount with 'Âm'", () => {
    expect(toVietnameseCurrencyWords(-1000)).toBe("Âm một nghìn đồng")
  })
})
