import './style.scss'

class Base {
  constructor() {
    this.canvas = document.querySelector('#canvas')
    this.audio = document.querySelector('audio')
    this.popin = document.querySelector('#intro')

    this.initAudio(this.audio)
    this.initCanvas()
    this.listener()
  }

  initAudio(audioEvent) {
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
    this.analyser.fftSize = 256

    // frequencyBinCount : number of data values you will have to play with for the visualization (half of FFT)
    this.bufferLength = this.analyser.frequencyBinCount

    // Initialization of an array containing all our amplitudes
    this.dataArray = new Uint8Array(this.bufferLength)
  }

  initCanvas() {
    this.ctx = this.canvas.getContext('2d')
    this.canvasSize()
    this.barHeight = 10
    this.x = 0
    this.renderFrame()
  }

  canvasSize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.WIDTH = this.canvas.width
    this.HEIGHT = this.canvas.height
    this.barWidth = this.WIDTH / this.bufferLength
  }

  listener() {
    document.querySelector('#click-me').addEventListener('click', (event) => {
      event.preventDefault()
      this.popin.classList.add('hide')
      setTimeout(() => {
        this.context.resume()
        this.audio.play()
      }, 1000)
    })
    window.addEventListener('resize', () => {
      this.canvasSize()
    })
  }

  renderFrame() {
    this.x = 0
    this.analyser.getByteFrequencyData(this.dataArray)
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT)
    for (let i = 0; i < this.bufferLength; i++) {
      this.barHeight = this.dataArray[i] * 3

      let r = this.barHeight + 25 * (i / this.bufferLength)
      let g = 250 * (i / this.bufferLength)
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
    requestAnimationFrame(this.renderFrame.bind(this))
  }
}

new Base()
