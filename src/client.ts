import { Oscillator, Volume } from 'tone'
import { Keymap, Status } from './enums'
import { setPreciseInterval } from './helpers'
import { Color, CoreInstance, CoreModule } from './types'

class Client {
  private module: CoreModule
  private instance: CoreInstance
  private memory: Uint8Array
  private screen: Uint8Array
  private keys: Uint8Array
  private timers: Uint8ClampedArray

  private volumeNode: Volume
  private oscillator: Oscillator
  private frameBuffer: Uint8ClampedArray
  private frameImageData: ImageData
  private canvas: HTMLCanvasElement
  private canvasContext: CanvasRenderingContext2D
  private rom?: Uint8Array
  private _stop?: () => void

  private _status = Status.Ready
  private _volume = 50
  private _screenScale = 10
  cyclesPerSecond = 800
  colors: [Color, Color] = [
    [32, 32, 32],
    [249, 249, 249],
  ]

  constructor(module: CoreModule) {
    // @ts-ignore
    const { buffer } = <WebAssembly.Memory>module.memory

    this.module = module
    this.instance = module.createInstance()
    this.memory = new Uint8Array(buffer, module.getMemoryPointer(this.instance), 4096)
    this.screen = new Uint8Array(buffer, module.getScreenPointer(this.instance), 2048)
    this.keys = new Uint8Array(buffer, module.getKeysPointer(this.instance), 16)
    this.timers = new Uint8ClampedArray(buffer, module.getTimersPointer(this.instance), 2)

    this.volumeNode = new Volume(-35).toDestination()
    this.oscillator = new Oscillator(700, 'square').connect(this.volumeNode)
    this.frameBuffer = new Uint8ClampedArray(this.screen.length * 4).fill(255)
    this.frameImageData = new ImageData(this.frameBuffer, 64, 32)
    this.canvas = document.createElement('canvas')
    this.canvasContext = this.canvas.getContext('2d')!
    this.screenScale = this._screenScale
    this.volume = this._volume
    this.bindKeys()
  }

  get status() {
    return this._status
  }

  get screenScale() {
    return this._screenScale
  }

  set screenScale(scale: number) {
    this._screenScale = scale
    this.canvas.width = 64 * scale * window.devicePixelRatio
    this.canvas.height = 32 * scale * window.devicePixelRatio
    this.canvas.style.width = `${64 * scale}px`
    this.canvas.style.height = `${32 * scale}px`
    this.canvasContext.imageSmoothingEnabled = false
  }

  get volume() {
    return this._volume
  }

  set volume(value: number) {
    this._volume = value
    this.volumeNode.volume.value = -30 * ((100 - value) / 100) - 20
    this.volumeNode.mute = !Boolean(value)
  }

  start() {
    const id = { value: 0 }
    const clearTimers = this.setTimers()
    let previousTime = performance.now()

    const renderFrame = (time: DOMHighResTimeStamp) => {
      const delta = time - previousTime
      const cycles = Math.round(delta / (1000 / this.cyclesPerSecond))
      previousTime = time

      for (let i = 0; i < cycles; i++) this.module.runCycle(this.instance)
      for (let i = 0; i < this.screen.length; i++) {
        this.frameBuffer[i * 4] = this.colors[this.screen[i]][0]
        this.frameBuffer[i * 4 + 1] = this.colors[this.screen[i]][1]
        this.frameBuffer[i * 4 + 2] = this.colors[this.screen[i]][2]
      }

      const { width, height } = this.canvas
      this.canvasContext.putImageData(this.frameImageData, 0, 0)
      this.canvasContext.drawImage(this.canvas, 0, 0, 64, 32, 0, 0, width, height)
      id.value = requestAnimationFrame(renderFrame)
    }

    this._stop = () => {
      cancelAnimationFrame(id.value)
      clearTimers()
      this._status = Status.Stopped
    }

    id.value = requestAnimationFrame(renderFrame)
    this._status = Status.Running
  }

  stop() {
    this._stop?.()
  }

  reset() {
    this.stop()
    this.module.reset(this.instance)
    if (this.rom) this.memory.set(this.rom, 0x200)
    this.start()
  }

  load(buffer: ArrayBuffer) {
    this.rom = new Uint8Array(buffer)
    this.reset()
  }

  appendCanvasTo(target: HTMLElement) {
    target.appendChild(this.canvas)
  }

  dispose() {
    this.stop()
    this.unbindKeys()
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!Keymap.hasOwnProperty(event.code)) return
    if (event.repeat) return

    const keyValue = Keymap[<keyof typeof Keymap>event.code]
    this.keys[keyValue] = 1
  }

  private onKeyUp = (event: KeyboardEvent) => {
    if (!Keymap.hasOwnProperty(event.code)) return
    if (event.repeat) return

    const keyValue = Keymap[<keyof typeof Keymap>event.code]
    this.keys[keyValue] = 0

    if (this.memory[0xb0] === 1) {
      this.memory[0xb0] = 2
      this.memory[0xb1] = keyValue
    }
  }

  private bindKeys() {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  private unbindKeys() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  private setTimers() {
    return setPreciseInterval(() => {
      if (this.timers[1] > 0) this.oscillator.start()
      else this.oscillator.stop()

      this.timers[0]--
      this.timers[1]--
    }, 1000 / 60)
  }
}

export default Client
