export function formatPeriod(fromYear: number, toYear: number) {
  if (fromYear === toYear) {
    return formatYear(fromYear)
  }

  return `${formatYear(fromYear)} — ${formatYear(toYear)}`
}

export function formatPeriodAsCenturies(fromYear: number, toYear: number) {
  const fromCentury = getCentury(fromYear)
  const toCentury = getCentury(toYear)
  const era = toYear < 0 ? 'до н. э.' : ''
  const range =
    fromCentury === toCentury
      ? toRoman(fromCentury)
      : `${toRoman(fromCentury)}-${toRoman(toCentury)}`

  return `${range} вв.${era ? ` ${era}` : ''}`
}

function formatYear(year: number) {
  return year < 0 ? `${Math.abs(year)} до н. э.` : `${year} н. э.`
}

function getCentury(year: number) {
  return Math.max(1, Math.ceil(Math.abs(year) / 100))
}

function toRoman(value: number) {
  const numerals: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]

  let remainder = value
  let result = ''

  for (const [number, numeral] of numerals) {
    while (remainder >= number) {
      result += numeral
      remainder -= number
    }
  }

  return result
}
