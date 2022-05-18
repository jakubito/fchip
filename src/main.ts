import Two from 'two.js'
import { Constants } from 'two.js/src/constants'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import { Oscillator } from 'tone'
import { instantiate } from '../core/build/core'
import { setPreciseInterval } from './helpers'
import { Keymap } from './enums'
import './style.css'

const CYCLES_PER_SECOND = 1200
const PIXEL_SIZE = 10
const PIXEL_OFF = '#f9f9f9'
const PIXEL_ON = '#222222'

const moduleUrl = import.meta.env.PROD
  ? `/core.wasm?v=${import.meta.env.VITE_APP_CORE_VERSION}`
  : 'http://localhost:8001/debug.wasm'

const compiledModule = await WebAssembly.compileStreaming(fetch(moduleUrl))
const module = await instantiate(compiledModule, { env: {} })

// @ts-ignore
const { buffer } = <WebAssembly.Memory>module.memory
const instance = module.createInstance()
const memory = new Uint8Array(buffer, module.getMemoryPointer(instance), 4096)
const screen = new Uint8Array(buffer, module.getScreenPointer(instance), 2048)
const keys = new Uint8Array(buffer, module.getKeysPointer(instance), 16)
const timers = new Uint8ClampedArray(buffer, module.getTimersPointer(instance), 2)

const fileInput = document.querySelector<HTMLInputElement>('#file')!
const loadButton = document.querySelector<HTMLButtonElement>('#load')!
const screenElement = document.querySelector<HTMLCanvasElement>('#screen')!

const oscillator = new Oscillator(1000, 'square').toDestination()
const pixels = new Array<Rectangle>(screen.length)
const two = new Two({ type: Constants.Types.canvas, width: 640, height: 320 })
two.appendTo(screenElement)

document.addEventListener('keydown', (event) => {
  if (!Keymap.hasOwnProperty(event.code)) return
  if (event.repeat) return

  const keyValue = Keymap[<keyof typeof Keymap>event.code]
  keys[keyValue] = 1
})

document.addEventListener('keyup', (event) => {
  if (!Keymap.hasOwnProperty(event.code)) return
  if (event.repeat) return

  const keyValue = Keymap[<keyof typeof Keymap>event.code]
  keys[keyValue] = 0

  if (memory[0xb0] === 1) {
    memory[0xb0] = 2
    memory[0xb1] = keyValue
  }
})

loadButton.addEventListener('click', async () => {
  if (!fileInput.files?.length) return
  const buffer = await fileInput.files[0].arrayBuffer()
  memory.set(new Uint8Array(buffer), 0x200)
  start()
})

function start() {
  setPixels()
  setTimers()
  startRendering()
}

function setPixels() {
  for (let i = 0; i < screen.length; i++) {
    const x = (i % 64) * PIXEL_SIZE + PIXEL_SIZE / 2
    const y = Math.floor(i / 64) * PIXEL_SIZE + PIXEL_SIZE / 2
    const pixel = two.makeRectangle(x, y, PIXEL_SIZE, PIXEL_SIZE)
    pixel.noStroke()
    pixels[i] = pixel
  }
}

function setTimers() {
  setPreciseInterval(() => {
    if (timers[1] > 0) oscillator.start()
    else oscillator.stop()
    timers[0]--
    timers[1]--
  }, 1000 / 60)
}

function startRendering() {
  let previousTime = performance.now()

  function frame(time: DOMHighResTimeStamp) {
    const delta = time - previousTime
    const cycles = Math.round(delta / (1000 / CYCLES_PER_SECOND))
    previousTime = time

    for (let i = 0; i < cycles; i++) module.runCycle(instance)
    for (let i = 0; i < screen.length; i++) pixels[i].fill = screen[i] ? PIXEL_ON : PIXEL_OFF

    two.update()
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}
