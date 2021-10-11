export function indexToFrequency(
  index: number,
  fftSize: number,
  sampleRate: number
) {
  const nyquist = sampleRate / 2
  return index * (nyquist / fftSize)
}

export function frequencyToIndex(
  frequency: number,
  fftSize: number,
  sampleRate: number
) {
  const nyquist = sampleRate / 2
  return Math.round((frequency / nyquist) * fftSize)
}
