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

  private gui = MyDat.getGUI().addFolder('visualizer')

  constructor(buffer: Uint8Array) {
    this.dataArray = buffer
    this.canvas = document.querySelector('#visualizer-canvas')
    this.zoom = { max: this.dataArray.length - 1, min: 0 }

    this.initCanvas()
    this.listener()
  }

  initCanvas() {
    this.ctx = this.canvas.getContext('2d')
    this.canvasSize()
    this.barHeight = 10
    this.x = 0
    this.renderFrame()
  }

  canvasSize() {
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientHeight
    this.WIDTH = this.canvas.width
    this.HEIGHT = this.canvas.height
  }

  listener() {
    window.addEventListener('resize', () => {
      this.canvasSize()
    })
  }

  initGui() {
    this.gui.add(this.zoom, 'min', 0, this.dataArray.length, 1)
    this.gui.add(this.zoom, 'max', 0, this.dataArray.length, 1)
  }

  renderFrame() {
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
}
