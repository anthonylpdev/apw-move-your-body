import '@style/index.scss'
import Setup from '@js/setup.ts'
import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0)
const params = new URL(document.location).searchParams
if (!params.has('debug')) stats.dom.style.display = 'none'

document.body.appendChild(stats.dom)

let threeRaf = () => {}

Setup().then(({ cb, raf }) => {
  threeRaf = raf
  setTimeout(cb, 0)
})

raf()

function raf() {
  stats.begin()
  threeRaf()
  stats.end()
  requestAnimationFrame(raf)
}
