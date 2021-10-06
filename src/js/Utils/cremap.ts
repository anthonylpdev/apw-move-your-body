import { clamp } from 'three/src/math/MathUtils'
import remap from './remap'

export default function cremap(
  value: number,
  int1: [number, number],
  int2: [number, number]
) {
  return remap(clamp(value, int1[0], int1[1]), int1, int2)
}
