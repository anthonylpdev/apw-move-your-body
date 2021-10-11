import { lerp } from 'three/src/math/MathUtils'
import observableState, { ObservableState } from '../../Utils/observableState'
import testHarmonic from '../../Utils/testHarmonic'
import Audio from '../Audio'

// type Harmonic = {
//   freq: number,
//   offset: number,
//   data: {
//     val: number,
//     amount: number
//   }
// }

export class Note {
  freq: number
  offset: number

  private tempVal: number
  private amount: number
  // private computedMaxVal: number = 0

  normVal: number
  val: number
  maxVal: number
  easeVal: number = 0

  constructor({
    freq,
    offset,
    maxVal,
  }: {
    freq: number
    offset: number
    maxVal: number
  }) {
    this.freq = freq
    this.maxVal = maxVal
    this.offset = offset
  }

  reset() {
    this.tempVal = 0
    this.amount = 0
  }

  add(dataFreq: number, value: number, treshold: number) {
    if (!testHarmonic(dataFreq, this.freq, this.offset, treshold)) return
    this.tempVal += value
    this.amount++
  }

  fixVal(comparator: number) {
    const newVal = this.tempVal / this.amount
    this.val = newVal - comparator
    this.normVal = this.val / this.maxVal
    this.easeVal =
      this.normVal > this.easeVal ? this.normVal : this.easeVal - 0.02
    // this.computedMaxVal = Math.max(this.val, this.computedMaxVal)
  }
}

let bassMax = 0
let bassSpeedMax = 0

export default class Analyser {
  private audio: Audio
  public state: {
    averageVolume: number
    melody1: Note
    melody2: Note
    melody3: Note
    melody4: Note
    melody5: Note
    melody6: Note
    melody7: Note
    melody8: Note
    harmonicComparison: number
    freqOccupency: number
    bass: {
      previous: number
      current: number
      speed: number
      max: number
      maxSpeed: number
    }
  }

  constructor(audio: Audio) {
    this.audio = audio
    this.state = {
      averageVolume: 0,
      melody1: new Note({
        freq: 195.9521484375,
        offset: 8.61328125, // Melody
        maxVal: 8.23,
      }),
      melody2: new Note({
        freq: 219.63867187499997,
        offset: 10.7666015625, // Melody
        maxVal: 10.87,
      }),
      melody3: new Note({
        freq: 329.4580078125,
        offset: 4.306640625, // Melody
        maxVal: 19.4,
      }),
      melody4: new Note({
        freq: 389.75097656250006,
        offset: 62.4462890625, // Melody
        maxVal: 18.2,
      }),
      melody5: new Note({
        freq: 437.1240234375,
        offset: 62.4462890625, // Melody
        maxVal: 17.37,
      }),
      melody6: new Note({
        freq: 493.11035156249994,
        offset: 8.61328125, // Melody Higher than 27/-3
        maxVal: 25.83,
      }),
      melody7: new Note({
        freq: 585.703125,
        offset: 0, // Melody 2
        maxVal: 24.6,
      }),
      melody8: new Note({
        freq: 656.7626953125,
        offset: 12.919921875,
        maxVal: 28.18,
      }),
      freqOccupency: 0,
      harmonicComparison: 0,
      bass: {
        previous: 0,
        current: 0,
        speed: 0,
        maxSpeed: 34,
        max: 84,
      },
    }
  }

  private analyseNotes() {
    const skip = 40

    let freqOccupency = 0
    let harmCompVal = 0
    let harmCompAmount = 0
    const harmKeys = [
      'melody1',
      'melody2',
      'melody3',
      'melody4',
      'melody5',
      'melody6',
      'melody7',
      'melody8',
    ]

    for (const k of harmKeys) (this.state[k] as Note).reset()

    let avVolume = 0
    const treshold = this.audio.convertIndexToFrequency(0.5)
    for (let i = 0; i < this.audio.dataArray.length; i++) {
      const d = this.audio.dataArray[i]
      if (d > 40) freqOccupency++
      if (i > skip) {
        harmCompAmount++
        harmCompVal += d
        const indexFreq = this.audio.convertIndexToFrequency(i)

        for (const k of harmKeys)
          (this.state[k] as Note).add(indexFreq, d, treshold)
      }
      avVolume += d
    }

    harmCompVal /= harmCompAmount
    avVolume /= this.audio.dataArray.length
    this.state.harmonicComparison = harmCompVal
    this.state.averageVolume = avVolume
    this.state.freqOccupency = freqOccupency / this.audio.dataArray.length
    for (const k of harmKeys)
      (this.state[k] as Note).fixVal(this.state.harmonicComparison)
  }

  public analyse() {
    this.analyseNotes()

    this.state.bass.previous = this.state.bass.current
    this.state.bass.current =
      Math.max(this.audio.dataArray[3] - 200, 0) +
      Math.max(this.audio.dataArray[2] - 180, 0)
    this.state.bass.speed =
      Math.max(this.state.bass.current - this.state.bass.previous, 0) /
      this.state.bass.maxSpeed

    bassMax = Math.max(this.state.bass.current, bassMax)
    bassSpeedMax = Math.max(this.state.bass.speed, bassSpeedMax)
  }
}
