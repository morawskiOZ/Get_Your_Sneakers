import formatMoney from "../lib/formatMoney"

describe("formatMoney func", () => {
  it("works with fractional dollars", () => {
    expect(formatMoney(1)).toEqual("$0.01")
    expect(formatMoney(10)).toEqual("$0.10")
  })

  it("leaves the cents off for whole dollars", () => {
    expect(formatMoney(5000)).toEqual("$50")
    expect(formatMoney(100)).toEqual("$1")
    expect(formatMoney(500000)).toEqual("$5,000")
  })

  it("works with whole and fractional dollars", () => {
    expect(formatMoney(5012)).toEqual("$50.12")
    expect(formatMoney(101)).toEqual("$1.01")
  })
})
