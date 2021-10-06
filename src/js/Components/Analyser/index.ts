import observableState, { ObservableState } from '../../Utils/observableState'
import testHarmonic from '../../Utils/testHarmonic'

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

  constructor({
    freq,
    offset,
    maxVal,
  }: {
    freq: number
    offset: number
    maxVal
  }) {
    this.freq = freq
    this.maxVal = maxVal
    this.offset = offset
  }

  reset() {
    this.tempVal = 0
    this.amount = 0
  }

  add(index: number, value: number) {
    if (!testHarmonic(index, this.freq, this.offset)) return
    this.tempVal += value
    this.amount++
  }

  fixVal(comparator: number) {
    const newVal = this.tempVal / this.amount
    this.val = newVal - comparator
    this.normVal = this.val / this.maxVal
    // this.computedMaxVal = Math.max(this.val, this.computedMaxVal)
  }
}

let bassMax = 0
let bassSpeedMax = 0

export default class Analyser {
  private dataArray: Uint8Array
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

  constructor(dataArray: Uint8Array) {
    this.dataArray = dataArray
    this.state = {
      averageVolume: 0,
      melody1: new Note({
        freq: 9.1,
        offset: 0.4, // Melody
        maxVal: 8.23,
      }),
      melody2: new Note({
        freq: 10.2,
        offset: 0.5, // Melody
        maxVal: 10.87,
      }),
      melody3: new Note({
        freq: 15.3,
        offset: 0.2, // Melody
        maxVal: 19.4,
      }),
      melody4: new Note({
        freq: 18.1,
        offset: 2.9, // Melody
        maxVal: 18.2,
      }),
      melody5: new Note({
        freq: 20.3,
        offset: 2.9, // Melody
        maxVal: 17.37,
      }),
      melody6: new Note({
        freq: 22.9,
        offset: 0.4, // Melody Higher than 27/-3
        maxVal: 25.83,
      }),
      melody7: new Note({
        freq: 27.2,
        offset: 0, // Melody 2
        maxVal: 24.6,
      }),
      melody8: new Note({
        freq: 30.5,
        offset: 0.6, // Melody Higher than 27/-3
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

    for (const k of harmKeys) this.state[k].reset()

    let avVolume = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      const d = this.dataArray[i]
      if (d > 40) freqOccupency++
      if (i > skip) {
        harmCompAmount++
        harmCompVal += d

        for (const k of harmKeys) this.state[k].add(i, d)
      }
      avVolume += d
    }

    harmCompVal /= harmCompAmount
    avVolume /= this.dataArray.length
    this.state.harmonicComparison = harmCompVal
    this.state.averageVolume = avVolume
    this.state.freqOccupency = freqOccupency / this.dataArray.length
    for (const k of harmKeys)
      this.state[k].fixVal(this.state.harmonicComparison)
  }

  public analyse() {
    this.analyseNotes()

    this.state.bass.previous = this.state.bass.current
    this.state.bass.current =
      Math.max(this.dataArray[3] - 200, 0) +
      Math.max(this.dataArray[2] - 180, 0)
    this.state.bass.speed =
      Math.max(this.state.bass.current - this.state.bass.previous, 0) /
      this.state.bass.maxSpeed

    bassMax = Math.max(this.state.bass.current, bassMax)
    bassSpeedMax = Math.max(this.state.bass.speed, bassSpeedMax)
  }
}
