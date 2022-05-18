import Two from 'two.js'
import { Constants } from 'two.js/src/constants'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import { instantiate } from '../core/build/core'
import { setPreciseInterval } from './helpers'
import { Key, Keymap } from './types'
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
const pixels = new Array<Rectangle>(screen.length)

const fileInput = document.querySelector<HTMLInputElement>('#file')!
const loadButton = document.querySelector<HTMLButtonElement>('#load')!
const screenElement = document.querySelector<HTMLCanvasElement>('#screen')!

const two = new Two({
  type: Constants.Types.canvas,
  width: 640,
  height: 320,
}).appendTo(screenElement)

document.addEventListener('keydown', (event) => {
  if (event.code in Keymap) keys[Keymap[<Key>event.code]] = 1
})

document.addEventListener('keyup', (event) => {
  if (event.code in Keymap) keys[Keymap[<Key>event.code]] = 0
})

loadButton.addEventListener('click', async () => {
  if (!fileInput.files?.length) return
  const file = fileInput.files[0]
  const buffer = await file.arrayBuffer()
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
