import { Oscillator, Volume } from 'tone'
import { instantiate } from '../core/build/core'
import { setPreciseInterval } from './helpers'
import { Keymap } from './enums'
import './style.css'

let cyclesPerSecond = 1000
let screenScale = 1
const colors = [
  [32, 32, 32],
  [249, 249, 249],
]

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
const display = document.querySelector<HTMLCanvasElement>('#display')!
const cyclesInput = document.querySelector<HTMLInputElement>('#cycles-input')!
const cyclesValue = document.querySelector<HTMLSpanElement>('#cycles-value')!
const scaleInput = document.querySelector<HTMLInputElement>('#scale')!
const volumeInput = document.querySelector<HTMLInputElement>('#volume')!

const volumeNode = new Volume(-35).toDestination()
const oscillator = new Oscillator(800, 'square').connect(volumeNode)
const frameBuffer = new Uint8ClampedArray(screen.length * 4).fill(255)
const frameImageData = new ImageData(frameBuffer, 64, 32)
const displayContext = display.getContext('2d')!
setDisplayScale(screenScale)

let stop: () => void

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
  load(buffer)
})

cyclesInput.addEventListener('input', () => {
  cyclesPerSecond = Number(cyclesInput.value)
  cyclesValue.innerHTML = cyclesInput.value
})

scaleInput.addEventListener('input', () => {
  setDisplayScale(Number(scaleInput.value) / 100)
})

volumeInput.addEventListener('input', () => {
  const value = Number(volumeInput.value)
  if (value === 0) {
    volumeNode.mute = true
  } else {
    volumeNode.mute = false
    volumeNode.volume.value = -30 * ((100 - value) / 100) - 20
  }
})

function setDisplayScale(scale: number) {
  display.width = 640 * scale * window.devicePixelRatio
  display.height = 320 * scale * window.devicePixelRatio
  display.style.width = `${640 * scale}px`
  display.style.height = `${320 * scale}px`
  displayContext.imageSmoothingEnabled = false
}

function load(buffer: ArrayBuffer) {
  stop?.()
  module.reset(instance)
  memory.set(new Uint8Array(buffer), 0x200)
  stop = start()
}

function start() {
  const id = { value: 0 }
  const clearTimers = setTimers()
  let previousTime = performance.now()

  function renderFrame(time: DOMHighResTimeStamp) {
    const delta = time - previousTime
    const cycles = Math.round(delta / (1000 / cyclesPerSecond))
    previousTime = time

    for (let i = 0; i < cycles; i++) module.runCycle(instance)
    for (let i = 0; i < screen.length; i++) {
      frameBuffer[i * 4] = colors[screen[i]][0]
      frameBuffer[i * 4 + 1] = colors[screen[i]][1]
      frameBuffer[i * 4 + 2] = colors[screen[i]][2]
    }

    displayContext.putImageData(frameImageData, 0, 0)
    displayContext.drawImage(display, 0, 0, 64, 32, 0, 0, display.width, display.height)
    id.value = requestAnimationFrame(renderFrame)
  }

  function stop() {
    cancelAnimationFrame(id.value)
    clearTimers()
  }

  id.value = requestAnimationFrame(renderFrame)

  return stop
}

function setTimers() {
  return setPreciseInterval(() => {
    if (timers[1] > 0) oscillator.start()
    else oscillator.stop()
    timers[0]--
    timers[1]--
  }, 1000 / 60)
}
