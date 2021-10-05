import MyDat from '../../Utils/MyDat'

export default class Analyzer {
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

  public get isVisible(): boolean {
    return this._isVisible
  }
  public set isVisible(value: boolean) {
    this._isVisible = value
    this.canvas.classList.toggle('hide', !value)
    this.canvasSize()
  }

  private gui = MyDat.getGUI().addFolder('visualizer')

  constructor(buffer: Uint8Array, startVisible: boolean) {
    this.dataArray = buffer
    this.canvas = document.querySelector('#visualizer-canvas')
    this.zoom = { max: this.dataArray.length - 1, min: 0 }
    this.isVisible = startVisible

    this.initCanvas()
    this.listener()
    this.initGui()
  }

  public renderFrame() {
    if (!this.isVisible) return
    this.x = 0
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT)

    const length = Math.abs(this.zoom.max - this.zoom.min)
    this.barWidth = this.WIDTH / length

    for (let i = this.zoom.min; i <= this.zoom.max; i++) {
      this.barHeight = this.dataArray[i] * 3
      let r = this.barHeight + 25 * (i / length)
      let g = 250 * (i / length)
      let b = 50
      this.ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
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
  }
}
