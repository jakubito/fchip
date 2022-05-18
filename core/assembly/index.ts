import font from './font'

class Chip8 {
  codes: StaticArray<(this: Chip8) => void> = new StaticArray(0xf + 1)
  codes0x: StaticArray<(this: Chip8) => void> = new StaticArray(0xe + 1)
  codes8x: StaticArray<(this: Chip8) => void> = new StaticArray(0xe + 1)
  codesEx: StaticArray<(this: Chip8) => void> = new StaticArray(0xe + 1)
  codesFx: StaticArray<(this: Chip8) => void> = new StaticArray(0x65 + 1)

  memory: Uint8Array = new Uint8Array(4096)
  screen: Uint8Array = new Uint8Array(2048)
  keys: Uint8Array = new Uint8Array(16)
  timers: Uint8Array = new Uint8Array(2)
  variables: Uint8Array = new Uint8Array(16)
  stack: Uint16Array = new Uint16Array(16)

  stackIndex: u8 = 0
  index: u16 = 0
  opcode: u16 = 0
  pc: u16 = 0x200

  constructor() {
    this.codes[0x0] = this.handle0x
    this.codes[0x1] = this.code1NNN
    this.codes[0x2] = this.code2NNN
    this.codes[0x3] = this.code3XNN
    this.codes[0x4] = this.code4XNN
    this.codes[0x5] = this.code5XY0
    this.codes[0x6] = this.code6XNN
    this.codes[0x7] = this.code7XNN
    this.codes[0x8] = this.handle8x
    this.codes[0x9] = this.code9XY0
    this.codes[0xa] = this.codeANNN
    this.codes[0xb] = this.codeBNNN
    this.codes[0xc] = this.codeCXNN
    this.codes[0xd] = this.codeDXYN
    this.codes[0xe] = this.handleEx
    this.codes[0xf] = this.handleFx

    this.codes0x[0x0] = this.code00E0
    this.codes0x[0xe] = this.code00EE

    this.codes8x[0x0] = this.code8XY0
    this.codes8x[0x1] = this.code8XY1
    this.codes8x[0x2] = this.code8XY2
    this.codes8x[0x3] = this.code8XY3
    this.codes8x[0x4] = this.code8XY4
    this.codes8x[0x5] = this.code8XY5
    this.codes8x[0x6] = this.code8XY6
    this.codes8x[0x7] = this.code8XY7
    this.codes8x[0xe] = this.code8XYE

    this.codesEx[0x1] = this.codeEXA1
    this.codesEx[0xe] = this.codeEX9E

    this.codesFx[0x07] = this.codeFX07
    this.codesFx[0x0a] = this.codeFX0A
    this.codesFx[0x15] = this.codeFX15
    this.codesFx[0x18] = this.codeFX18
    this.codesFx[0x1e] = this.codeFX1E
    this.codesFx[0x29] = this.codeFX29
    this.codesFx[0x33] = this.codeFX33
    this.codesFx[0x55] = this.codeFX55
    this.codesFx[0x65] = this.codeFX65

    for (let i = 0; i < font.length; i++) {
      this.memory[0x50 + i] = font[i]
    }
  }

  runCycle(): void {
    this.opcode = ((<u16>this.memory[this.pc]) << 8) | this.memory[this.pc + 1]
    this.pc += 2
    this.codes[(this.opcode & 0xf000) >> 12].call(this)
  }

  getX(): u8 {
    return <u8>((this.opcode & 0x0f00) >> 8)
  }

  getY(): u8 {
    return <u8>((this.opcode & 0x00f0) >> 4)
  }

  getN(): u8 {
    return <u8>(this.opcode & 0x000f)
  }

  getNN(): u8 {
    return <u8>(this.opcode & 0x00ff)
  }

  getNNN(): u16 {
    return this.opcode & 0x0fff
  }

  getVX(): u8 {
    return this.variables[this.getX()]
  }

  getVY(): u8 {
    return this.variables[this.getY()]
  }

  setVX(value: u8): void {
    this.variables[this.getX()] = value
  }

  setVF(value: u8): void {
    this.variables[0xf] = value
  }

  handle0x(): void {
    this.codes0x[this.opcode & 0x000f].call(this)
  }

  handle8x(): void {
    this.codes8x[this.opcode & 0x000f].call(this)
  }

  handleEx(): void {
    this.codesEx[this.opcode & 0x000f].call(this)
  }

  handleFx(): void {
    this.codesFx[this.opcode & 0x00ff].call(this)
  }

  code00E0(): void {
    this.screen.fill(0)
  }

  code00EE(): void {
    this.stackIndex--
    this.pc = this.stack[this.stackIndex]
    this.stack[this.stackIndex] = 0
  }

  code1NNN(): void {
    this.pc = this.getNNN()
  }

  code2NNN(): void {
    this.stack[this.stackIndex] = this.pc
    this.stackIndex++
    this.pc = this.getNNN()
  }

  code3XNN(): void {
    if (this.getVX() === this.getNN()) this.pc += 2
  }

  code4XNN(): void {
    if (this.getVX() !== this.getNN()) this.pc += 2
  }

  code5XY0(): void {
    if (this.getVX() === this.getVY()) this.pc += 2
  }

  code6XNN(): void {
    this.setVX(this.getNN())
  }

  code7XNN(): void {
    this.setVX(this.getVX() + this.getNN())
  }

  code8XY0(): void {
    this.setVX(this.getVY())
  }

  code8XY1(): void {
    this.setVX(this.getVX() | this.getVY())
  }

  code8XY2(): void {
    this.setVX(this.getVX() & this.getVY())
  }

  code8XY3(): void {
    this.setVX(this.getVX() ^ this.getVY())
  }

  code8XY4(): void {
    const oldVX = this.getVX()
    this.setVX(this.getVX() + this.getVY())
    this.setVF(oldVX > this.getVX() ? 1 : 0)
  }

  code8XY5(): void {
    const oldVX = this.getVX()
    this.setVX(this.getVX() - this.getVY())
    this.setVF(oldVX < this.getVX() ? 0 : 1)
  }

  code8XY6(): void {
    const oldVX = this.getVX()
    this.setVX(oldVX >> 1)
    this.setVF(oldVX & 1)
  }

  code8XY7(): void {
    const oldVX = this.getVX()
    this.setVX(this.getVY() - this.getVX())
    this.setVF(oldVX < this.getVX() ? 0 : 1)
  }

  code8XYE(): void {
    const oldVX = this.getVX()
    this.setVX(oldVX << 1)
    this.setVF(oldVX >> 7)
  }

  code9XY0(): void {
    if (this.getVX() !== this.getVY()) this.pc += 2
  }

  codeANNN(): void {
    this.index = this.getNNN()
  }

  codeBNNN(): void {
    this.pc = this.getNNN() + this.variables[0]
  }

  codeCXNN(): void {
    this.setVX((<u8>Math.floor(Math.random() * 256)) & this.getNN())
  }

  codeDXYN(): void {
    const positionX = this.getVX() % 64
    const positionY = this.getVY() % 32
    this.setVF(0)

    for (let rowIndex: u8 = 0; rowIndex < this.getN(); rowIndex++) {
      const spriteRow = this.memory[this.index + rowIndex]

      for (let columnIndex: u8 = 0; columnIndex < 8; columnIndex++) {
        const spritePixel = (spriteRow >> (7 - columnIndex)) & 1
        const pixelIndex = <u16>(positionY + rowIndex) * 64 + positionX + columnIndex
        const oldPixel = this.screen[pixelIndex]
        this.screen[pixelIndex] ^= spritePixel

        if (oldPixel === 1 && this.screen[pixelIndex] === 0) this.setVF(1)
        if (positionX + columnIndex === 63) break
      }

      if (positionY + rowIndex === 31) break
    }
  }

  codeEXA1(): void {
    if (this.keys[this.getVX()] === 0) this.pc += 2
  }

  codeEX9E(): void {
    if (this.keys[this.getVX()] === 1) this.pc += 2
  }

  codeFX07(): void {
    this.setVX(this.timers[0])
  }

  codeFX0A(): void {
    if (this.memory[0xb0] === 2) {
      this.memory[0xb0] = 0
      this.setVX(this.memory[0xb1])
    } else {
      this.memory[0xb0] = 1
      this.pc -= 2
    }
  }

  codeFX15(): void {
    this.timers[0] = this.getVX()
  }

  codeFX18(): void {
    this.timers[1] = this.getVX()
  }

  codeFX1E(): void {
    this.index += this.getVX()
  }

  codeFX29(): void {
    this.index = 0x50 + this.getVX() * 5
  }

  codeFX33(): void {
    this.memory[this.index] = this.getVX() / 100
    this.memory[this.index + 1] = (this.getVX() / 10) % 10
    this.memory[this.index + 2] = (this.getVX() % 100) % 10
  }

  codeFX55(): void {
    for (let i: u8 = 0; i <= this.getX(); i++) {
      this.memory[this.index + i] = this.variables[i]
    }
  }

  codeFX65(): void {
    for (let i: u8 = 0; i <= this.getX(); i++) {
      this.variables[i] = this.memory[this.index + i]
    }
  }
}

export function createInstance(): Chip8 {
  return new Chip8()
}

export function runCycle(instance: Chip8): void {
  instance.runCycle()
}

export function getMemoryPointer(instance: Chip8): usize {
  return changetype<usize>(instance.memory.buffer) + instance.memory.byteOffset
}

export function getScreenPointer(instance: Chip8): usize {
  return changetype<usize>(instance.screen.buffer) + instance.screen.byteOffset
}

export function getKeysPointer(instance: Chip8): usize {
  return changetype<usize>(instance.keys.buffer) + instance.keys.byteOffset
}

export function getTimersPointer(instance: Chip8): usize {
  return changetype<usize>(instance.timers.buffer) + instance.timers.byteOffset
}
