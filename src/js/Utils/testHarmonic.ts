export default function testHarmonic(
  base: number,
  freq: number,
  offset: number,
  treshold: number
) {
  const div = Math.round(base / freq)
  const approx = freq * div + (offset % freq)
  const diff = Math.abs(approx - base)
  return diff < treshold
}
