import {
  frequencyToIndex,
  indexToFrequency,
} from '../../Utils/frequencyConversion'
import remap from '../../Utils/remap'
import testHarmonic from '../../Utils/testHarmonic'

export default class Audio {
  private audio: HTMLAudioElement
  private context: AudioContext
  private source: MediaElementAudioSourceNode
  private analyser: AnalyserNode
  private bufferLength: number
  public dataArray: Uint8Array

  // private gui = MyDat.getGUI().addFolder('audio')

  constructor(volume: number = 0.05) {
    this.audio = document.querySelector('audio')
    this.initAudio(this.audio, volume)
  }

  private initAudio(audioEvent: HTMLAudioElement, volume: number) {
    // Avoid Cross origin issue
    audioEvent.crossOrigin = 'anonymous'

    // Create an audio source node based on an audio HTML element
    this.context = new AudioContext()
    this.source = this.context.createMediaElementSource(audioEvent)

    // Create and link an audio analyser
    this.analyser = this.context.createAnalyser()
    this.source.connect(this.analyser)
    this.analyser.connect(this.context.destination)

    // FFT (Fast Fourier Transform) => Representation of the amplitude sound frequencies
    // "fftSize" Must be a power of 2 between 2^5 and 2^15, defaults to 2048.
    this.analyser.fftSize = 2048
    this.analyser.maxDecibels = -20

    // frequencyBinCount : number of data values you will have to play with for the visualization (half of FFT)
    this.bufferLength = this.analyser.frequencyBinCount

    // Initialization of an array containing all our amplitudes
    this.dataArray = new Uint8Array(this.bufferLength)

    this.audio.volume = volume
    // this.gui.add(this.audio, 'volume', 0, 1)
  }

  public play() {
    this.context.resume()
    this.audio.play()
  }

  public pause() {
    this.context.suspend()
    this.audio.pause()
  }

  public toggle() {
    if (this.audio.paused) this.play()
    else this.pause()
  }

  public setAtProg(prog: number) {
    this.audio.currentTime = remap(prog, [0, 1], [0, this.audio.duration])
  }

  public back() {
    this.audio.currentTime = Math.max(this.audio.currentTime - 2, 0)
  }

  public forward() {
    this.audio.currentTime = Math.min(
      this.audio.currentTime + 2,
      this.audio.duration
    )
  }

  public update() {
    this.analyser.getByteFrequencyData(this.dataArray)
  }

  public convertIndexToFrequency(index: number) {
    return indexToFrequency(
      index,
      this.dataArray.length,
      this.context.sampleRate
    )
  }

  public convertFrequencyToIndex(frequency: number) {
    return frequencyToIndex(
      frequency,
      this.dataArray.length,
      this.context.sampleRate
    )
  }
}
