import MyDat from '../../Utils/MyDat'
import testHarmonic from '../../Utils/testHarmonic'
import Analyser from '../Analyser'

export default class Visualizer {
  private canvas: HTMLCanvasElement
  private dataArray: Uint8Array
  private ctx: CanvasRenderingContext2D
  private WIDTH: number
  private HEIGHT: number
  private barWidth: number
  private barHeight: number
  private x: number
  private zoom = { max: 0, min: 0 }
  private _isVisible = false
  public analyserState: Analyser['state']

  private harm = {
    freq: 27,
    offset: -3,
  }
  // private harm = {
  //   freq: 15,
  //   offset: 13, // Start
  // }
  // private harm = {
  //   freq: 27,
  //   offset: -3, // Melody 2
  // }
  // private harm = {
  //   freq: 23,
  //   offset: 2, // Melody Higher than 27/-3
  // }
  // private harm = {
  //   freq: 31,
  //   offset: 5, // Melody
  // }
  // private harm = {
  //   freq: 21,
  //   offset: 11, // Melody
  // }

  public get isVisible(): boolean {
    return this._isVisible
  }
  public set isVisible(value: boolean) {
    this._isVisible = value
    this.canvas.classList.toggle('hide', !value)
    this.canvasSize()
  }

  private gui = MyDat.getGUI().addFolder('visualizer')

  constructor(
    buffer: Uint8Array,
    startVisible: boolean,
    analyserState: Analyser['state']
  ) {
    this.analyserState = analyserState
    this.dataArray = buffer
    this.canvas = document.querySelector('#visualizer-canvas')
    this.zoom = { max: this.dataArray.length - 1, min: 0 }
    this.isVisible = startVisible

    this.initCanvas()
    this.listener()
    this.initGui()
  }

  private debugSound(sound: number, x: number, y: number, fill: string) {
    this.ctx.fillStyle = fill
    this.ctx.beginPath()
    this.ctx.arc(x, y, Math.max(sound, 0) * 45 + 5, 0, Math.PI * 2)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.strokeStyle = fill
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.arc(x, y, 50, 0, Math.PI * 2)
    this.ctx.closePath()
    this.ctx.stroke()
  }

  public renderFrame() {
    if (!this.isVisible) return
    this.x = 0
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT)

    const length = Math.abs(this.zoom.max - this.zoom.min)
    this.barWidth = this.WIDTH / length

    const s = this.analyserState

    this.debugSound(s.melody1.normVal, 100, 100, 'red')
    this.debugSound(s.melody2.normVal, 200, 100, 'magenta')
    this.debugSound(s.melody3.normVal, 300, 100, 'green')
    this.debugSound(s.melody4.normVal, 400, 100, 'yellow')
    this.debugSound(s.melody5.normVal, 500, 100, 'white')
    this.debugSound(s.melody6.normVal, 600, 100, 'orange')
    this.debugSound(s.melody7.normVal, 700, 100, 'grey')
    this.debugSound(s.melody8.normVal, 800, 100, 'cyan')
    this.debugSound(s.freqOccupency, 100, 200, 'white')
    this.debugSound(s.averageVolume / 100, 200, 200, 'grey')
    this.debugSound(s.bass.current / s.bass.max, 300, 200, 'red')
    this.debugSound(s.bass.speed, 400, 200, 'red')

    for (let i = this.zoom.min; i <= this.zoom.max; i++) {
      this.barHeight = this.dataArray[i] * 3
      let r = this.barHeight + 25 * (i / length)
      let g = 250 * (i / length)
      let b = 50
      if (testHarmonic(i, this.harm.freq, this.harm.offset)) {
        this.ctx.fillStyle = 'blue'
      } else this.ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
      this.ctx.fillRect(
        this.x,
        this.HEIGHT - this.barHeight,
        this.barWidth,
        this.barHeight
      )
      this.x += this.barWidth + 1
    }
  }

  public show() {
    this.canvas.style.display = 'none'
  }

  private initCanvas() {
    this.ctx = this.canvas.getContext('2d')
    this.canvasSize()
    this.barHeight = 10
    this.x = 0
    this.renderFrame()
  }

  private canvasSize() {
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientHeight
    this.WIDTH = this.canvas.width
    this.HEIGHT = this.canvas.height
  }

  private listener() {
    window.addEventListener('resize', () => {
      this.canvasSize()
    })
  }

  private initGui() {
    this.gui.open()
    this.gui.add(this, 'isVisible').name('show')
    this.gui.add(this.zoom, 'min', 0, this.dataArray.length, 1)
    this.gui.add(this.zoom, 'max', 0, this.dataArray.length, 1)
    this.gui.add(this.harm, 'freq').step(0.1)
    this.gui.add(this.harm, 'offset').step(0.1)
  }
}
